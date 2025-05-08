import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/db';

export async function GET() {
  try {
    const connected = await testConnection();
    
    if (connected) {
      return NextResponse.json({ message: 'Conexão com o banco de dados bem-sucedida!' });
    } else {
      return NextResponse.json(
        { error: 'Falha na conexão com o banco de dados' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erro ao testar conexão:', error);
    return NextResponse.json(
      { error: 'Erro ao testar conexão com o banco de dados' },
      { status: 500 }
    );
  }
}