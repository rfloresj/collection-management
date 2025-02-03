import { NextRequest, NextResponse } from 'next/server';
import db from '@/libs/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/authOptions';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          message: 'Unauthorized',
        },
        {
          status: 401,
        }
      );
    }

    const collections = await db.collection.findMany({
      where: { userId: parseInt(session.user.id) },
    });

    return NextResponse.json(collections);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch collections';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, attributes } = await request.json();

    if (!name || !description) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newCollection = await db.collection.create({
      data: {
        name,
        description,
        attributes: JSON.stringify(attributes || []),
        userId: parseInt(session.user.id),
      },
    });

    return NextResponse.json(newCollection, { status: 201 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create collection';
    return NextResponse.json(
      {
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { message: 'Invalid collection ID' },
        { status: 400 }
      );
    }

    const collection = await db.collection.findUnique({
      where: { id: Number(id) },
    });

    if (!collection || collection.userId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { message: 'Collection not found or access denied' },
        { status: 404 }
      );
    }

    await db.collection.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(
      { message: 'Collection deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to delete collection';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id, name, description, attributes } = await request.json();

    if (!id || !name || !description) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const collection = await db.collection.findUnique({
      where: { id: Number(id) },
    });

    if (!collection || collection.userId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { message: 'Collection not found or access denied' },
        { status: 404 }
      );
    }

    const updatedCollection = await db.collection.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
        attributes: JSON.stringify(attributes || []),
      },
    });

    return NextResponse.json(updatedCollection, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to update collection';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
