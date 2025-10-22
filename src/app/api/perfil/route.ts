// src/app/api/perfil/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

// --- GET: Buscar dados do perfil do usuário logado ---
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const userId = session.user.id;
  console.log(`GET /api/perfil - Buscando perfil para User ID: ${userId}`);

  try {
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: { // **** CAMPOS ADICIONADOS AQUI ****
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        cpf: true,     // <--- Adicionado
        rg: true,      // <--- Adicionado
        birthDate: true, // <--- Adicionado
        cep: true,     // <--- Adicionado
        logradouro: true, // <--- Adicionado
        numero: true,  // <--- Adicionado
        complemento: true,// <--- Adicionado
        bairro: true,  // <--- Adicionado
        cidade: true,  // <--- Adicionado
        estado: true,  // <--- Adicionado
        pais: true,    // <--- Adicionado
      },
    });

    if (!userProfile) {
      console.error(`GET /api/perfil - Usuário não encontrado no DB: ${userId}`);
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    console.log(`GET /api/perfil - Perfil encontrado para: ${userProfile.email}`);
    return NextResponse.json(userProfile);

  } catch (error) {
    console.error(`Erro ao buscar perfil para User ID ${userId}:`, error);
    return NextResponse.json({ error: 'Erro interno ao buscar perfil' }, { status: 500 });
  }
}

// --- PUT: Atualizar dados do perfil do usuário logado ---
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const userId = session.user.id;
  console.log(`PUT /api/perfil - Iniciando atualização para User ID: ${userId}`);

  try {
    const body = await request.json();
    // **** CAMPOS ADICIONADOS AQUI ****
    const {
        name, email, phone, image,
        cpf, rg, birthDate, // <--- Adicionado
        cep, logradouro, numero, complemento, bairro, cidade, estado, pais // <--- Adicionado
    } = body;

    // Validação básica
    if (!name || !email) {
      return NextResponse.json({ error: 'Nome e Email são obrigatórios' }, { status: 400 });
    }

    // ... (Validação de email duplicado, se implementada) ...

    const updatedProfile = await prisma.user.update({
      where: { id: userId },
      data: { // **** CAMPOS ADICIONADOS AQUI ****
        name: name,
        email: email,
        phone: phone || null,
        image: image,
        cpf: cpf || null,       // <--- Adicionado
        rg: rg || null,         // <--- Adicionado
        birthDate: birthDate ? new Date(birthDate) : null, // <--- Adicionado (converter string)
        cep: cep || null,       // <--- Adicionado
        logradouro: logradouro || null, // <--- Adicionado
        numero: numero || null, // <--- Adicionado
        complemento: complemento || null, // <--- Adicionado
        bairro: bairro || null, // <--- Adicionado
        cidade: cidade || null, // <--- Adicionado
        estado: estado || null, // <--- Adicionado
        pais: pais || 'Brasil', // <--- Adicionado
      },
      select: { // **** CAMPOS ADICIONADOS AQUI ****
        id: true, name: true, email: true, image: true, phone: true,
        cpf: true, rg: true, birthDate: true, // <--- Adicionado
        cep: true, logradouro: true, numero: true, complemento: true, // <--- Adicionado
        bairro: true, cidade: true, estado: true, pais: true, // <--- Adicionado
      }
    });

    console.log(`PUT /api/perfil - Perfil atualizado para: ${updatedProfile.email}`);
    return NextResponse.json(updatedProfile);

  } catch (error: any) {
    console.error(`Erro ao atualizar perfil para User ID ${userId}:`, error);
     if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
         return NextResponse.json({ error: 'Este email já está em uso por outro usuário.' }, { status: 409 });
     }
     if (error.code === 'P2002' && error.meta?.target?.includes('cpf')) { // <-- Adicionar verificação de CPF duplicado
         return NextResponse.json({ error: 'Este CPF já está em uso por outro usuário.' }, { status: 409 });
     }
    if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Usuário não encontrado para atualização' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Erro interno ao atualizar perfil' }, { status: 500 });
  }
}