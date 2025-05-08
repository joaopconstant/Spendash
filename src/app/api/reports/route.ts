import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { query } from "@/lib/db";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    if (!month || !year) {
      return NextResponse.json(
        { error: "Mês e ano são obrigatórios" },
        { status: 400 }
      );
    }

    // Relatório por categoria
    const categoryReport = await query(
      `SELECT 
        c.id, c.name, c.color, 
        SUM(t.amount) as total 
      FROM 
        transactions t 
      JOIN 
        categories c ON t.category_id = c.id 
      WHERE 
        t.user_id = ? AND 
        MONTH(t.date) = ? AND 
        YEAR(t.date) = ? 
      GROUP BY 
        c.id, c.name, c.color
      ORDER BY
        total DESC`,
      [session.user.id, month, year]
    );

    // Total do mês
    const monthTotalResult = (await query(
      `SELECT 
        SUM(amount) as total 
      FROM 
        transactions 
      WHERE 
        user_id = ? AND 
        MONTH(date) = ? AND 
        YEAR(date) = ?`,
      [session.user.id, month, year]
    )) as any[];

    const monthTotal = monthTotalResult[0]?.total || 0;

    // Evolução diária dos gastos
    const dailyExpenses = await query(
      `SELECT 
        DAY(date) as day, 
        SUM(amount) as total 
      FROM 
        transactions 
      WHERE 
        user_id = ? AND 
        MONTH(date) = ? AND 
        YEAR(date) = ? 
      GROUP BY 
        DAY(date)
      ORDER BY 
        day ASC`,
      [session.user.id, month, year]
    );

    // Comparação com o mês anterior
    const previousMonth = month === "1" ? "12" : String(parseInt(month) - 1);
    const previousYear = month === "1" ? String(parseInt(year) - 1) : year;

    const previousMonthTotalResult = (await query(
      `SELECT 
        SUM(amount) as total 
      FROM 
        transactions 
      WHERE 
        user_id = ? AND 
        MONTH(date) = ? AND 
        YEAR(date) = ?`,
      [session.user.id, previousMonth, previousYear]
    )) as any[];

    const previousMonthTotal = previousMonthTotalResult[0]?.total || 0;

    // Calcular variação percentual
    let percentageChange = 0;
    if (previousMonthTotal > 0) {
      percentageChange =
        ((monthTotal - previousMonthTotal) / previousMonthTotal) * 100;
    }

    return NextResponse.json({
      categories: categoryReport,
      total: monthTotal,
      dailyExpenses,
      comparison: {
        previousMonthTotal,
        percentageChange,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
