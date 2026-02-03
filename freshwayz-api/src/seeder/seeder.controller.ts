import { Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from '../vendor/entities/vendor.entity';
import { Product } from '../products/entities/product.entity';
import { Customer } from '../customer/entities/customer.entity';
import { UserType } from '../user-type/entities/user-type.entity';

@Controller('seed')
export class SeederController {
    constructor(
        @InjectRepository(Vendor) private readonly vendorRepo: Repository<Vendor>,
        @InjectRepository(Product) private readonly productRepo: Repository<Product>,
        @InjectRepository(Customer) private readonly customerRepo: Repository<Customer>,
        @InjectRepository(UserType) private readonly userTypeRepo: Repository<UserType>,
    ) { }

    @Post('dashboard-data')
    async seedDashboardData() {
        // helpers
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15); // mid last month

        // Ensure UserTypes exist
        let vendorType = await this.userTypeRepo.findOne({ where: { typeName: 'Vendor' } });
        if (!vendorType) vendorType = await this.userTypeRepo.save({ typeName: 'Vendor', description: 'Vendor' });

        let customerType = await this.userTypeRepo.findOne({ where: { typeName: 'Customer' } });
        if (!customerType) customerType = await this.userTypeRepo.save({ typeName: 'Customer', description: 'Customer' });

        // Seed Vendors (3 last month, 1 this month)
        const vendors = [
            { name: "Organic Harvest", email: "info@organicharvest.com", date: lastMonth },
            { name: "Green Valley Farms", email: "contact@greenvalley.com", date: lastMonth },
            { name: "Fresh Basket", email: "support@freshbasket.com", date: lastMonth },
            { name: "Daily Greens", email: "hello@dailygreens.com", date: now },
        ];

        for (const v of vendors) {
            // Check if exists
            const existing = await this.vendorRepo.findOne({ where: { email: v.email } });
            if (!existing) {
                const vendor = this.vendorRepo.create({
                    businessName: v.name,
                    email: v.email,
                    ownerName: "Test Owner",
                    userType: vendorType,
                    createdAt: v.date, // Verify if this works (might be overridden by database default)
                });
                await this.vendorRepo.save(vendor);
                // Manually update createdAt because @CreateDateColumn might override on save
                await this.vendorRepo.update({ email: v.email }, { createdAt: v.date });
            }
        }

        // Seed Customers (4 last month, 2 this month)
        const customers = [
            { name: "Alice Johnson", email: "alice@example.com", date: lastMonth },
            { name: "Bob Smith", email: "bob@example.com", date: lastMonth },
            { name: "Charlie Brown", email: "charlie@example.com", date: lastMonth },
            { name: "Diana Prince", email: "diana@example.com", date: lastMonth },
            { name: "Evan Wright", email: "evan@example.com", date: now },
            { name: "Fiona Clark", email: "fiona@example.com", date: now },
        ];

        for (const c of customers) {
            const existing = await this.customerRepo.findOne({ where: { email: c.email } });
            if (!existing) {
                const customer = this.customerRepo.create({
                    fullName: c.name,
                    email: c.email,
                    userType: customerType,
                    createdAt: c.date,
                });
                await this.customerRepo.save(customer);
                await this.customerRepo.update({ email: c.email }, { createdAt: c.date });
            }
        }

        // Seed Products (Associated with first vendor for simplicity)
        const vendor = await this.vendorRepo.findOne({ where: { email: "info@organicharvest.com" } });
        if (vendor) {
            const products = [
                { label: "Fresh Tomatoes", date: lastMonth },
                { label: "Organic Potatoes", date: lastMonth },
                { label: "Carrots", date: lastMonth },
                { label: "Spinach", date: now },
                { label: "Broccoli", date: now },
            ];

            for (const p of products) {
                // minimal product
                const product = this.productRepo.create({
                    label: p.label,
                    description: "Fresh vegetable",
                    productUrl: "http://example.com/img.jpg",
                    measurementUnit: "kg",
                    measurementValue: "1",
                    vendor: vendor,
                    createdAt: p.date
                });
                const saved = await this.productRepo.save(product);
                await this.productRepo.update({ id: saved.id }, { createdAt: p.date });
            }
        }

        return { message: "Seeding complete with backdated data" };
    }
}
