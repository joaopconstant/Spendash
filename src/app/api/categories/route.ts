import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { query } from "@/lib/db";
import { z } from "zod";
import { authOptions } from "../auth/[...nextauth]/route";

// Schema de validação para criação de categorias
const categorySchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Cor deve ser um código hexadecimal válido"),
});

// Obter todas as categorias do usuário
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar categorias do usuário e categorias padrão
    const categories = await query(
      `SELECT * FROM categories 
       WHERE user_id = ? OR is_default = TRUE 
       ORDER BY name ASC`,
      [session.user.id]
    );

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}

// Criar uma nova categoria
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();

    // Validar os dados recebidos
    const result = categorySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.format() },
        { status: 400 }
      );
    }

    const { name, color } = result.data;

    // Inserir categoria
    await query(
      "INSERT INTO categories (user_id, name, color, is_default) VALUES (?, ?, ?, FALSE)",
      [session.user.id, name, color]
    );

    return NextResponse.json(
      { message: "Categoria criada com sucesso" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}

// Atualizar uma categoria existente
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();

    // Validar os dados recebidos
    const updateSchema = z.object({
      id: z.number().int().positive(),
      name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
      color: z
        .string()
        .regex(/^#[0-9A-F]{6}$/i, "Cor deve ser um código hexadecimal válido"),
    });

    const result = updateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.format() },
        { status: 400 }
      );
    }

    const { id, name, color } = result.data;

    // Verificar se a categoria existe e pertence ao usuário
    const categories = (await query(
      "SELECT * FROM categories WHERE id = ? AND user_id = ? AND is_default = FALSE",
      [id, session.user.id]
    )) as any[];

    if (categories.length === 0) {
      return NextResponse.json(
        { error: "Categoria não encontrada ou não pode ser editada" },
        { status: 404 }
      );
    }

    // Atualizar categoria
    await query("UPDATE categories SET name = ?, color = ? WHERE id = ?", [
      name,
      color,
      id,
    ]);

    return NextResponse.json({ message: "Categoria atualizada com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}

// Excluir uma categoria
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID da categoria é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se a categoria existe e pertence ao usuário
    const categories = (await query(
      "SELECT * FROM categories WHERE id = ? AND user_id = ? AND is_default = FALSE",
      [id, session.user.id]
    )) as any[];

    if (categories.length === 0) {
      return NextResponse.json(
        { error: "Categoria não encontrada ou não pode ser excluída" },
        { status: 404 }
      );
    }

    // Verificar se existem transações associadas à categoria
    const transactions = (await query(
      "SELECT COUNT(*) as count FROM transactions WHERE category_id = ?",
      [id]
    )) as any[];

    if (transactions[0].count > 0) {
      return NextResponse.json(
        {
          error:
            "Não é possível excluir uma categoria que possui transações associadas",
        },
        { status: 400 }
      );
    }

    // Excluir categoria
    await query("DELETE FROM categories WHERE id = ?", [id]);

    return NextResponse.json({ message: "Categoria excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
