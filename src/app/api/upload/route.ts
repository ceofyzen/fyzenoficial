// src/app/api/upload/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto'; // Para nomes únicos

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    // Validação básica do tipo de arquivo (recomendado)
    if (!file.type.startsWith('image/')) {
        return NextResponse.json({ success: false, error: 'Tipo de arquivo inválido. Apenas imagens são permitidas.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Gera nome de arquivo único
    const fileExtension = path.extname(file.name);
    const uniqueFilename = `${randomUUID()}${fileExtension}`;

    // Caminho completo para salvar o arquivo
    const savePath = path.join(process.cwd(), 'public', 'uploads', uniqueFilename);

    // Salva o arquivo
    await writeFile(savePath, buffer);
    console.log(`Arquivo salvo em: ${savePath}`);

    // Retorna a URL pública (acessível pelo navegador)
    const publicUrl = `/uploads/${uniqueFilename}`;

    return NextResponse.json({ success: true, url: publicUrl });

  } catch (error) {
    console.error("Erro no upload:", error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no servidor';
    return NextResponse.json({ success: false, error: `Erro interno no servidor: ${errorMessage}` }, { status: 500 });
  }
}