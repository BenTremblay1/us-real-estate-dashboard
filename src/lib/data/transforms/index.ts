// Generic transform pipeline interface.
// Specific implementations (MLS, tax assessor, FRED) will be added
// when Snowflake table schemas are available.

export interface TransformPipeline<TInput, TOutput> {
  transform(input: TInput): TOutput;
  transformBatch(inputs: TInput[]): TOutput[];
}

export abstract class BaseTransform<TInput, TOutput> implements TransformPipeline<TInput, TOutput> {
  abstract transform(input: TInput): TOutput;

  transformBatch(inputs: TInput[]): TOutput[] {
    return inputs.map((input) => this.transform(input));
  }
}
