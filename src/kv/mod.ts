type KvDbSchemaInterface<T> = {
    name(value: string): KvDbSchema<T>
    primary(name: string): KvDbSchema<T>
    secondary(name: string): KvDbSchema<T>
    create(): KvDbModel<T>
    kv: Deno.Kv
}

type KvDbModelInterface<T> = {
    index(value: string): KvDbModel<T>
    get(value: string, index?: string): Promise<T | T[]>
    save(value: T): void
    remove(value: string): void
}

enum SchemaProp {
    NAME = 'name',
    PRIMARY = 'primary',
    SECONDARY = 'secondary'
}

enum ModelProp {
    INDEX = 'index',
    LIMIT = 'limit',
    GET = 'get'
}

type KvDbSchemaConfig = {
    prop: SchemaProp;
    value: string;
}

type KvDbModelConfig = {
    prop: ModelProp;
    value: string;
}

class KvDbModel<T> implements KvDbModelInterface<T> {
    private config: Map<ModelProp, string | number>
    private schema: Map<SchemaProp, string | Set<string>>
    private kv: Deno.Kv;

    constructor(schema: Map<SchemaProp, string | Set<string>>, kv: Deno.Kv) {
        this.config = new Map<ModelProp, string | number>();
        this.schema = schema;
        this.kv = kv;
        this.index(this.schema.get(SchemaProp.PRIMARY) as string);
    }

    index(value: string) {
        this.config.set(ModelProp.INDEX, value)
        return this;
    }

    limit(value: number) {
        this.config.set(ModelProp.LIMIT, value)
        return this;
    }

    async get(value: string, index?: string): Promise<T | T[]> {
        if (index) this.index(index);

        const key = `${this.schema.get(SchemaProp.NAME)}_by_${this.config.get(ModelProp.INDEX)}`;

        if (this.config.get(ModelProp.INDEX) == this.schema.get(SchemaProp.PRIMARY)) {
            const res = await this.kv.get<T>([key, value]);

            if (!res.value) throw new Error('No values found');

            return res.value;
        } else {
            const res = this.kv.list<T>({ prefix: [key, value] });
            const results: T[] = [];

            for await (const v of res) {
                results.push(v.value);
            }

            if (results.length <= 0) throw new Error('No values found');
            if (results.length == 1) return results[0];

            return results;
        }
    }

    async save(value: T) {
        const atomic = this.kv.atomic();
        const name = this.schema.get(SchemaProp.NAME);
        const primary = this.schema.get(SchemaProp.PRIMARY) as keyof T;

        for (const [k, v] of this.schema.entries()) {
            if (k == SchemaProp.PRIMARY) {
                const indexName = v as keyof T;
                atomic.set([`${name}_by_${v}`, value[indexName] as string], value);
            }

            if (k == SchemaProp.SECONDARY) {
                if (isSet(v)) {
                    for ( const i of v.values() ) {
                        const indexName = i as keyof T;
                        atomic.set([`${name}_by_${i}`, value[indexName] as string, value[primary] as string], value);
                    }

                }

            }
        }

        await atomic.commit();
    }

    async remove(value: string, index?: string) {
        if (index) this.index(index);

        const atomic = this.kv.atomic();
        const name = this.schema.get(SchemaProp.NAME);
        const primary = this.schema.get(SchemaProp.PRIMARY) as keyof T;
        const key = `${this.schema.get(SchemaProp.NAME)}_by_${this.config.get(ModelProp.INDEX)}`;
        let toRemove;

        if (this.config.get(ModelProp.INDEX) == this.schema.get(SchemaProp.PRIMARY)) {
            const res = await this.kv.get<T>([key, value]);

            if (!res.value) throw new Error('No values found for removal');

            toRemove = res.value;
        } else {
            const res = this.kv.list<T>({ prefix: [key, value] }, { limit: 1 });
            for await (const v of res) {
                toRemove = v.value;
            }

            if (!toRemove) throw new Error('No values found for removal');
        }

        for (const [k, v] of this.schema.entries()) {
            if (k == SchemaProp.PRIMARY) {
                const indexName = v as keyof T;
                atomic.delete([`${name}_by_${v}`, toRemove[indexName] as string]);
            }

            if (k == SchemaProp.SECONDARY) {
                if (isSet(v)) {
                    for ( const i of v.values() ) {
                        const indexName = i as keyof T;
                        atomic.delete([`${name}_by_${i}`, toRemove[indexName] as string, toRemove[primary] as string]);
                    }

                }

            }
        }

        await atomic.commit();
    }
}

class KvDbSchema<T> implements KvDbSchemaInterface<T> {
    private config: Map<SchemaProp, string | Set<string>>
    public kv: Deno.Kv

    constructor(kv: Deno.Kv) {
        this.config = new Map<SchemaProp, string | Set<string>>();
        this.config.set(SchemaProp.SECONDARY, new Set<string>());
        this.kv = kv;
    }

    name (value: string) {
        this.config.set(SchemaProp.NAME, value );
        return this;
    }

    primary (value: string) {
        this.config.set(SchemaProp.PRIMARY, value);
        return this;
    }

    secondary (value: string) {
        const secondaryIndexes = this.config.get(SchemaProp.SECONDARY);

        if (isSet(secondaryIndexes)) {
            secondaryIndexes.add(value);
            this.config.set(SchemaProp.SECONDARY, secondaryIndexes);
        }

        return this;
    }

    create () {
        return new KvDbModel<T>(this.config, this.kv);
    }
}

function isSet(v: unknown): v is Set<string> {
    return (v as Set<string>).size != undefined;
}

export function kvdb<T>(denoKv: Deno.Kv): KvDbSchemaInterface<T> {
    return new KvDbSchema<T>(denoKv)
}
