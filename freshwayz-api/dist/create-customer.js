"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./src/user/entities/user.entity");
const AppDataSource = new typeorm_1.DataSource({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '',
    database: 'freshways',
    entities: ['src/**/*.entity.ts'],
    synchronize: false,
});
async function createTestCustomer() {
    try {
        await AppDataSource.initialize();
        const userRepository = AppDataSource.getRepository(user_entity_1.User);
        const testUser = userRepository.create({
            id: 16,
            fullName: 'Test Customer',
            email: 'customer@test.com',
            phone: '9876543210',
            userType: { id: 3 },
        });
        await userRepository.save(testUser);
        console.log('✅ Test customer created with ID 16');
        await AppDataSource.destroy();
    }
    catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}
createTestCustomer();
//# sourceMappingURL=create-customer.js.map