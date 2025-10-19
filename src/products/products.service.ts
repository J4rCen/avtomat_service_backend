import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { readFile, writeFile } from 'fs/promises'
import { resolve } from 'path';

@Injectable()
export class ProductsService {

	private pathFile = resolve(__dirname, '../../store/products.json')

	// Получает ошибки и логирует их
	private errorLog(err: string) {
		writeFile(
			resolve(__dirname, '../../logs/logs.txt'),
			`${new Date()}: ${err}\n`,
			{
				encoding: 'utf-8',
				flag: 'a'
			}
		).catch(
			err => console.error('Ошибка при записи в логи: ', err)
		)
	}

	// Чтение файла с продуктами
	private async readFile() {
		try {
			const file = await readFile(this.pathFile, 'utf-8');
			if (typeof file !== 'string') throw new Error(file)
			return JSON.parse(file)

		} catch (err) {
			this.errorLog(err);
			throw new Error(err)
		}
	}

	// Изменения json файла
	private async processingFile(newList: any) {
		try {
			const json = JSON.stringify(newList)
			writeFile(this.pathFile, json, {
				encoding: 'utf-8',
				flag: 'w'
			})

		} catch (err) {
			this.errorLog(err)
			throw new Error(err)
		}
	}

	// Поиск всех продуктов
	async findAll() {
		try {

			const productsList = await this.readFile()
			return productsList

		} catch (error) {
			return {
				statusCode: 500,
				message: 'Не предвиденная ошибка на сервере',
			}
		}
	}

	// Поиск продукта по id
	async findOne(id: string) {
		try {

			const productsList = await this.readFile()

			if (productsList[id]) {
				return productsList[id]
			} else {
				throw new NotFoundException('Товар не найден')
			}

		} catch (error) {

			if (error instanceof NotFoundException) {
				throw error
			}

			this.errorLog(error)
			return {
				statusCode: 500,
				message: 'Не предвиденная ошибка на сервере',
			}
		}
	}

	// Создание нового продукта и добавления в файл products.json
	async create(createProductDto: CreateProductDto) {
		try {

			const productsList = await this.readFile() 
			const { id } = createProductDto

			if (productsList[id]) throw new ConflictException('Товар с таким id уже существует')

			productsList[id] = createProductDto

			await this.processingFile(productsList)

			return {statusCode: 200, message: 'Запись успешна создана'}

		} catch (error) {

			if (error instanceof ConflictException) {
				throw error
			}

			this.errorLog(error)
			return {
				statusCode: 500,
				message: 'Не предвиденная ошибка на сервере',
			}
		}
	}

	// Обновления продукта по id
	async update(id: string, updateProductDto: UpdateProductDto) {
		try {
			const productsList = await this.readFile()

			if (productsList[id]) {
				productsList[id] = {
					...productsList[id],
					...updateProductDto
				}
				await this.processingFile(productsList)

				return {statusCode: 200, message: 'Запись успешна изменена'}
			} else {
				throw new NotFoundException('Товар не найден')
			}


		} catch (error) {

			if (error instanceof NotFoundException) {
				throw error
			}

			this.errorLog(error)

			return {
				statusCode: 500,
				message: 'Не предвиденная ошибка на сервере',
			}
		}
	}

	// Удаление продукта по id
	async remove(id: string) {
		try {
			const productsList = await this.readFile()

			if (productsList[id]) {
				delete productsList[id]
				await this.processingFile(productsList)

				return {statusCode: 200, message: 'Запись успешна удалена'}
			} else {
				throw new NotFoundException('Товар не найден')
			}

		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error
			}

			this.errorLog(error)

			return {
				statusCode: 500,
				message: 'Не предвиденная ошибка на сервере',
			}
		}
	}
}
