import { Injectable } from '@nestjs/common';

type PersistInput = {
  params: { min: number; max: number; count: number; sort: 'asc' | 'desc' | 'none'; noDuplicates: boolean };
  results: number[];
}

@Injectable()
export class RandomService {
  persistDraw(input: PersistInput): string {
    // Stub de persistance: on renverra un ID simulé.
    // Remplacement ultérieur par insertion Supabase.
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return id;
  }
}


