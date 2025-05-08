import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { query } from "@/lib/db";
import { z } from "zod";
import { authOptions } from "../auth/[...nextauth]/route";

// Schema de validação para criação de transações
const transactionSchema = z.object({
  category_id: z.number().int().positive(),
  amount: z.number().positive("Valor deve ser positivo"),
  description: z.string().optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
});

// Obter transações do usuário
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    let sql = `
      SELECT 
        t.*, 
        c.name as category_name, 
        c.color as category_color 
      FROM 
        transactions t 
      JOIN 
        categories c ON t.category_id = c.id 
      WHERE 
        t.user_id = ?
    `;

    const params: any[] = [session.user.id];

    if (startDate && endDate) {
      sql += " AND t.date BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    sql += " ORDER BY t.date DESC";
    sql += " LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const transactions = await query(sql, params);

    // Contar total de registros para metadados de paginação
    let countSql = `
      SELECT COUNT(*) as total 
      FROM transactions 
      WHERE user_id = ?
    `;

    const countParams = [session.user.id];

    if (startDate && endDate) {
      countSql += " AND date BETWEEN ? AND ?";
      countParams.push(startDate, endDate);
    }

    const countResult = (await query(countSql, countParams)) as any[];
    const total = countResult[0].total;

    return NextResponse.json({
      data: transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar transações:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}

// Criar uma nova transação
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();

    // Validar os dados recebidos
    const result = transactionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.format() },
        { status: 400 }
      );
    }

    const { category_id, amount, description, date } = result.data;

    // Verificar se a categoria existe e pertence ao usuário ou é padrão
    const categories = (await query(
      "SELECT * FROM categories WHERE id = ? AND (user_id = ? OR is_default = TRUE)",
      [category_id, session.user.id]
    )) as any[];

    if (categories.length === 0) {
      return NextResponse.json(
        { error: "Categoria não encontrada ou não pertence ao usuário" },
        { status: 404 }
      );
    }

    // Inserir transação
    await query(
      "INSERT INTO transactions (user_id, category_id, amount, description, date) VALUES (?, ?, ?, ?, ?)",
      [session.user.id, category_id, amount, description || null, date]
    );

    return NextResponse.json(
      { message: "Transação registrada com sucesso" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao registrar transação:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}

// Atualizar uma transação existente
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
      category_id: z.number().int().positive(),
      amount: z.number().positive("Valor deve ser positivo"),
      description: z.string().optional(),
      date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
    });

    const result = updateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.format() },
        { status: 400 }
      );
    }

    const { id, category_id, amount, description, date } = result.data;

    // Verificar se a transação existe e pertence ao usuário
    const transactions = (await query(
      "SELECT * FROM transactions WHERE id = ? AND user_id = ?",
      [id, session.user.id]
    )) as any[];

    if (transactions.length === 0) {
      return NextResponse.json(
        { error: "Transação não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se a categoria existe e pertence ao usuário ou é padrão
    const categories = (await query(
      "SELECT * FROM categories WHERE id = ? AND (user_id = ? OR is_default = TRUE)",
      [category_id, session.user.id]
    )) as any[];

    if (categories.length === 0) {
      return NextResponse.json(
        { error: "Categoria não encontrada ou não pertence ao usuário" },
        { status: 404 }
      );
    }

    // Atualizar transação
    await query(
      "UPDATE transactions SET category_id = ?, amount = ?, description = ?, date = ? WHERE id = ?",
      [category_id, amount, description || null, date, id]
    );

    return NextResponse.json({ message: "Transação atualizada com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar transação:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}

// Excluir uma transação
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
        { error: "ID da transação é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se a transação existe e pertence ao usuário
    const transactions = (await query(
      "SELECT * FROM transactions WHERE id = ? AND user_id = ?",
      [id, session.user.id]
    )) as any[];

    if (transactions.length === 0) {
      return NextResponse.json(
        { error: "Transação não encontrada" },
        { status: 404 }
      );
    }

    // Excluir transação
    await query("DELETE FROM transactions WHERE id = ?", [id]);

    return NextResponse.json({ message: "Transação excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir transação:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
