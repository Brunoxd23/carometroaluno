import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

export async function GET() {
  try {
    await client.connect();
    const database = client.db('carometro');
    const groups = database.collection('groups');
    
    const data = await groups.find({}).toArray();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Erro ao buscar grupos:', err);
    return NextResponse.json({ error: 'Erro ao buscar grupos' }, { status: 500 });
  } finally {
    await client.close();
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await client.connect();
    const database = client.db('carometro');
    const groups = database.collection('groups');
    
    await groups.updateOne(
      { course: body.course, period: body.period },
      { $set: body },
      { upsert: true }
    );

    return NextResponse.json({ message: 'Grupo salvo com sucesso' });
  } catch (err) {
    console.error('Erro ao salvar grupo:', err);
    return NextResponse.json({ error: 'Erro ao salvar grupo' }, { status: 500 });
  } finally {
    await client.close();
  }
}
