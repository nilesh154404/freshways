import { DataSource } from 'typeorm';
import { User } from './src/user/entities/user.entity';

const AppDataSource = new DataSource({
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
    
    const userRepository = AppDataSource.getRepository(User);
    
    // Create or update test customer
    const testUser = userRepository.create({
      id: 16,
      fullName: 'Test Customer',
      email: 'customer@test.com',
      phone: '9876543210',
      userType: { id: 3 }, // Assuming 3 is customer type
    });
    
    await userRepository.save(testUser);
    console.log('✅ Test customer created with ID 16');
    
    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestCustomer();
