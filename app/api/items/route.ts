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

    const collectionId = request?.nextUrl?.searchParams?.get('collectionId');

    if (!collectionId || isNaN(Number(collectionId))) {
      return NextResponse.json(
        { message: 'Invalid collection iD' },
        { status: 400 }
      );
    }

    const collection = await db.collection.findUnique({
      where: { id: Number(collectionId) },
    });

    if (!collection || collection.userId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { message: 'Collection not found or access denied' },
        { status: 404 }
      );
    }

    const items = await db.item.findMany({
      where: {
        collectionId: Number(collectionId),
      },
    });

    const parsedItems = items.map((item) => ({
      ...item,
      attributes: JSON.parse(item.attributes),
    }));
    console.log('ITEMS:::', parsedItems);

    return NextResponse.json(parsedItems);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch items';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, tags, attributes, collectionId } = await request.json();

    if (!name || !collectionId) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const collection = await db.collection.findUnique({
      where: { id: parseInt(collectionId) },
    });

    if (!collection || collection.userId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { message: 'Collection not found or access denied' },
        { status: 404 }
      );
    }

    const newItem = await db.item.create({
      data: {
        name,
        tags: tags || {},
        attributes: JSON.stringify(attributes || {}),
        collectionId: Number(collectionId),
      },
    });

    return NextResponse.json(
      {
        message: 'Item created successfully',
        data: {
          ...newItem,
          attributes: JSON.parse(newItem.attributes),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create item';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
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
      return NextResponse.json({ message: 'Invalid item ID' }, { status: 400 });
    }

    const item = await db.item.findUnique({
      where: { id: Number(id) },
      include: { collection: true },
    });

    if (!item || item.collection.userId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { message: 'Item not found or access denied' },
        { status: 404 }
      );
    }

    await db.item.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(
      { message: 'Item deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to delete item';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id, name, tags, attributes, collectionId } = await request.json();

    if (!id || !name || !collectionId) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const collection = await db.collection.findUnique({
      where: { id: Number(collectionId) },
    });

    if (!collection || collection.userId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { message: 'Collection not found or access denied' },
        { status: 404 }
      );
    }

    const updatedItem = await db.item.update({
      where: { id: Number(id) },
      data: {
        name,
        tags: tags || {},
        attributes: JSON.stringify(attributes || {}),
      },
    });

    return NextResponse.json(
      {
        ...updatedItem,
        attributes: JSON.parse(updatedItem.attributes),
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to update item';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
