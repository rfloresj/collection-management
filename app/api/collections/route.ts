import { NextRequest, NextResponse } from 'next/server';
import db from '@/libs/db';

export async function GET(request: NextRequest) {
  try {
    const userId = request?.nextUrl?.searchParams?.get('userId');

    if (!userId) {
      return NextResponse.json(
        {
          message: 'User id not provided',
        },
        {
          status: 400,
        }
      );
    }

    const collections = await db.collection.findMany({
      where: { userId: Number(userId) },
    });

    return NextResponse.json(collections);
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
        message: 'An unknown error ocurred',
      });
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log('createCollection', payload, request.body);
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
        message: 'Successfully created',
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
        message: 'An unknown error ocurred',
      });
    }
  }
}
