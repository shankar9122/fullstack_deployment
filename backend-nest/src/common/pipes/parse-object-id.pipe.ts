import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isObjectIdOrHexString } from 'mongoose';

// Use it on a route parameter: @Param('id', ParseObjectIdPipe) id: string
// It does what validateObjectId() did in the Express API
@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!isObjectIdOrHexString(value)) {
      throw new BadRequestException('Invalid id');
    }
    return value;
  }
}