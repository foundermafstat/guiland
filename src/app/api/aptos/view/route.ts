import { NextRequest, NextResponse } from 'next/server';

const APTOS_NODE_URL = process.env.APTOS_NODE_URL || 'https://fullnode.testnet.aptoslabs.com/v1';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { function: functionName, type_arguments, arguments: args } = body;

    console.log('API View Request:', { functionName, type_arguments, arguments: args });

    const requestBody = {
      function: functionName,
      type_arguments,
      arguments: args,
    };
    
    console.log('Отправляем запрос к Aptos API:', {
      url: `${APTOS_NODE_URL}/view`,
      body: requestBody
    });

    const response = await fetch(`${APTOS_NODE_URL}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Ответ от Aptos API:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      let errorData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json();
      } else {
        const errorText = await response.text();
        console.error('Aptos API вернул HTML/текст вместо JSON:', errorText.substring(0, 200));
        errorData = { error: 'Invalid response format', text: errorText.substring(0, 200) };
      }
      
      // Если это ошибка 429 (Too Many Requests), ждем и повторяем запрос
      if (response.status === 429) {
        console.log('Получена ошибка 429, ждем 2 секунды и повторяем запрос...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Повторяем запрос
        const retryResponse = await fetch(`${APTOS_NODE_URL}/view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        
        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          console.log('Повторный запрос успешен:', retryData);
          return NextResponse.json(retryData);
        } else {
          console.error('Повторный запрос также не удался:', retryResponse.status);
        }
      }
      
      console.error('Aptos API Error:', errorData);
      return NextResponse.json(
        { error: 'Aptos API error', details: errorData },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text();
      console.error('Aptos API вернул не-JSON ответ:', responseText.substring(0, 200));
      return NextResponse.json(
        { error: 'Invalid response format from Aptos API', text: responseText.substring(0, 200) },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log('API View Response:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error calling Aptos view function:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 