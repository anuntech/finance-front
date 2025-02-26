import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(
	_: Request,
	{ params }: { params: Promise<{ collection: string }> }
) {
	try {
		if (process.env.NODE_ENV === "production") {
			throw new Error("Route not allowed");
		}

		const filePath = path.join(process.cwd(), "db.json");
		const fileContents = await fs.readFile(filePath, "utf8");
		const data = JSON.parse(fileContents);
		const collection = (await params).collection;
		const collectionData = data[collection];

		if (!collectionData) {
			return NextResponse.json(
				{ error: "Coleção não encontrada" },
				{ status: 404 }
			);
		}

		return NextResponse.json(collectionData);
	} catch (error) {
		return NextResponse.json(
			{ error: `Erro ao ler o arquivo db.json: ${error.message}` },
			{ status: 500 }
		);
	}
}
