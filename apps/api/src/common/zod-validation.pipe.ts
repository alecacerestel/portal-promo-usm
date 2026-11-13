import { BadRequestException, PipeTransform } from '@nestjs/common';
import { z } from 'zod';

/** Valida el body con un esquema Zod de @portal/shared (los mismos que usa el frontend). */
export class ZodValidationPipe<T extends z.ZodType> implements PipeTransform {
  constructor(private readonly schema: T) {}

  transform(value: unknown): z.output<T> {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Datos inválidos',
        errores: z.flattenError(result.error).fieldErrors,
      });
    }
    return result.data;
  }
}
