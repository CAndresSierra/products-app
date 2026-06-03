import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma.service';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) { }

  async create(createProductDto: CreateProductDto) {
    const newProduct = await this.prisma.product.create({
      data: createProductDto
    });

    return newProduct;
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;
    const total = await this.prisma.product.count({ where: { available: true } });
    const totalPages = Math.ceil(total / limit);

    return {
      data: await this.prisma.product.findMany({
        take: limit,
        skip,
        where: { available: true }
      }),
      metadata: {
        page,
        totalPages,
        hasNextPage: totalPages > page,
        total,
      }
    }
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id, available: true }
    })
    if (!product) throw new NotFoundException(`Product with id: ${id} not found`);

    return product
  }

  async update(id: number, updateProductDto: UpdateProductDto) {

    const { id: __, ...data } = updateProductDto

    await this.findOne(id);

    return await this.prisma.product.update({
      where: { id },
      data: data
    });

  }

  async remove(id: number) {
    await this.findOne(id);


    const product = await this.prisma.product.update({
      where: { id },
      data: {
        available: false
      }
    })

    return product
  }
}
