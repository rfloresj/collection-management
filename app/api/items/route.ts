import { NextRequest, NextResponse } from 'next/server';
import db from '@/libs/db';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log('createCollection', payload, request.body);
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
        message: 'Successfully created',
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
        message: 'An unknown error ocurred',
      });
    }
  }
}
