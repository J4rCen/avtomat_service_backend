export class CreateProductDto {
    id: string
    title: string
    price: string
    description: string
    image: string
    category: string

    constructor(data: CreateProductDto) {
        this.id = data.id
        this.title = data.title
        this.price = data.price
        this.description = data.description
        this.image = data.image
        this.category = data.category
    }
}
