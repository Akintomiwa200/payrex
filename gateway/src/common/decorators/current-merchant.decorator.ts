import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentMerchant = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (data) {
      return request.merchant?.[data];
    }
    return request.merchant;
  },
);
