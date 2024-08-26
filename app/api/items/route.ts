import { NextRequest, NextResponse } from "next/server";
import db from "@/libs/db";
import { getServerSession } from "next-auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          message: "No authenticated user",
        },
        {
          status: 403,
        }
      );
    }

    const collectionId = request?.nextUrl?.searchParams?.get("collectionId");

    if (!collectionId) {
      return NextResponse.json(
        {
          message: "No collectionId provided",
        },
        {
          status: 400,
        }
      );
    }

    const items = await db.item.findMany({
      where: {
        collectionId: Number(collectionId),
      },
    });

    console.log('ITEMS:::', items);

    return NextResponse.json(items);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: error.message,
        },
        {
          status: 500,
        }
      );
    } else {
      return NextResponse.json({
        message: "An unknown error ocurred",
      });
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log("createCollection", payload, request.body);
    const newItem = await db.item.create({
      data: {
        name: payload.name,
        tags: payload.tags,
        attributes: payload.attributes,
        collectionId: payload.collectionId,
      },
    });

    return NextResponse.json(
      {
        message: "Successfully created",
        data: newItem,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: error.message,
        },
        {
          status: 500,
        }
      );
    } else {
      return NextResponse.json({
        message: "An unknown error ocurred",
      });
    }
  }
}
