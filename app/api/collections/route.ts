import { NextRequest, NextResponse } from "next/server";
import db from "@/libs/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/authOptions";

export async function GET(request: NextRequest, response: NextResponse) {
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

    const result = await db.user.findUnique({
      where: { email: session?.user?.email },
      include: {
        collections: true
      }
    });

    return NextResponse.json(result?.collections);
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
    // console.log('createCollection', payload, request.body);
    const newCollection = await db.collection.create({
      data: {
        name: payload.name,
        description: payload.description,
        attributes: payload.attributes,
        userId: payload.userId,
      },
    });

    return NextResponse.json(
      {
        message: "Successfully created",
        data: newCollection,
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
