import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
    constructor(data: CreateProductDto) {
        super()
        this.title = data.title
        this.price = data.price
        this.description = data.description
        this.image = data.image
        this.category = data.category
    }
}
