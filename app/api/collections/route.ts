import { NextRequest, NextResponse } from 'next/server';
import db from '@/libs/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/authOptions';

export async function GET(request: NextRequest, response: NextResponse) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          message: 'No authenticated user',
        },
        {
          status: 403,
        }
      );
    }

    const result = await db.user.findUnique({
      where: { email: session?.user?.email },
      include: {
        collections: true,
      },
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
        message: 'An unknown error ocurred',
      });
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {name, description, attributes} = await request.json();

    const newCollection = await db.collection.create({
      data: {
        name,
        description,
        attributes: JSON.stringify(attributes),
        userId: parseInt(session.user.id),
      },
    });

    return NextResponse.json(newCollection);
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
