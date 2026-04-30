import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ILike } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { Categories } from 'src/categories/categories.entity';
import { Auth } from './entities/auth.entity';
import { UserType } from 'src/user-type/entities/user-type.entity';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';
import { RegisterVendorDto } from 'src/vendor/dto/register-vendor.dto';
import { AuthDto } from './dto/auth.dto';
import { RegisterCustomerDto } from 'src/customer/dto/register-customer.dto';
import { Customer } from 'src/customer/entities/customer.entity';
import { HealthProfile } from 'src/ai/entities/health-profile.entity';
import { analyzeHealthProfile } from 'src/ai/helpers/rule-based-health-analysis';
import { AiService } from 'src/ai/ai.service';
import axios from 'axios';

const DEFAULT_INTERNAL_ANALYSIS_PROMPT =
    'Generate health score, risks, nutrition guidance, fitness suggestions, product recommendations, and preventive alerts based on profile metrics and uploaded reports.';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Vendor) private readonly vendorRepo: Repository<Vendor>,
        @InjectRepository(Categories) private readonly categoriesRepo: Repository<Categories>,
        @InjectRepository(Auth) private readonly authRepo: Repository<Auth>,
        @InjectRepository(UserType) private readonly userTypeRepo: Repository<UserType>,
        @InjectRepository(Customer) private readonly customerRepo: Repository<Customer>,
        @InjectRepository(HealthProfile) private readonly healthProfileRepo: Repository<HealthProfile>,
        private readonly aiService: AiService,
        private readonly jwtService: JwtService
    ) { }

    // ---------------------- USER REGISTRATION ----------------------
    async registerUser(dto: RegisterUserDto) {
        const existingAuth = await this.authRepo.findOne({ where: { username: dto.username } });
        if (existingAuth) throw new BadRequestException('Username already exists');

        const userType = await this.userTypeRepo.findOne({ where: { typeName: dto.userType } });
        if (!userType) throw new BadRequestException(`UserType "${dto.userType}" not found`);

        const user = this.userRepo.create({ ...dto.user, userType });
        await this.userRepo.save(user);

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const auth = this.authRepo.create({ username: dto.username, password: hashedPassword, user });
        await this.authRepo.save(auth);

        return { message: 'User registered successfully' };
    }

    // ---------------------- Customer REGISTRATION ----------------------
    async registerCustomer(dto: RegisterCustomerDto, reportFiles: Express.Multer.File[] = []) {
        // Add validation check
        if (!dto.customer || !dto.customer.phone) {
            throw new BadRequestException('Customer data with phone is required');
        }

        const existingAuth = await this.authRepo.findOne({
            where: {
                // username: dto.username,
                username: dto.customer.phone,
                customer: {
                    email: dto.customer.email,
                    phone: dto.customer.phone
                },
            }
        });

        if (existingAuth) throw new BadRequestException('Username/Email/Phone already exists');

        const userType = await this.userTypeRepo.findOne({ where: { typeName: 'Customer' } });
        if (!userType) throw new BadRequestException('UserType "Customer" not found');

        const customer = this.customerRepo.create({ 
            ...dto.customer, 
            userType
        });
        await this.customerRepo.save(customer);

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const auth = this.authRepo.create({ username: dto.customer.phone, password: hashedPassword, customer });
        await this.authRepo.save(auth);

        let healthProfile: HealthProfile | null = null;
        let aiGeneratedInsights: any = null;

        // 3. Call external API using axios
        try {
            console.log({
                username: dto.customer.phone,
                password: dto.password,
                user_from: "app2_pharmacy_system",
            });

            const externalResponse = await axios.post(
                'https://healthamigoapi.dexpertsystems.com/user/internal/register',
                {
                    username: dto.customer.phone,
                    password: dto.password,
                    user_from: "app2_pharmacy_system",
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': 'XM4OeVKQT8SlRaVDC3RkFPaypmOe7CFcMU1hbseXB87RvXaFhC5vRUjOlq5hK5zA',
                    },
                    timeout: 10000,  // optional timeout
                }
            );

            return {
                message: 'Customer created successfully',
                localUser: this.mapCustomerResponse(customer),
                healthProfile: healthProfile ? analyzeHealthProfile(healthProfile) : null,
                aiGeneratedInsights: aiGeneratedInsights,
                externalResponse: externalResponse.data,
            };
        } catch (error) {
            console.error("External registration error:", {
                message: error.message,
                responseData: error.response?.data,
                responseStatus: error.response?.status,
                headers: error.response?.headers,
            });

            // optional: rollback local user creation if external fails
            // await this.repository.delete({ id: user.id });

            throw new BadRequestException(
                `External registration failed: ${error.response?.data?.message || error.message
                }`
            );
        }
        // return { message: 'Customer registered successfully' };
    }

    private calculateBmi(heightCm?: number, weightKg?: number): number {
        if (!heightCm || !weightKg || heightCm <= 0) {
            return 0;
        }

        const heightM = heightCm / 100;
        const bmi = weightKg / (heightM * heightM);
        return Number.isFinite(bmi) ? Number(bmi.toFixed(2)) : 0;
    }

    private async generatePersonalizedHealthInsights(
        healthData: any,
        reportFiles: Express.Multer.File[] = [],
        analysisPrompt?: string,
    ): Promise<any> {
        try {
            const extractedReports: Array<{ fileName: string; markdown: string }> = [];

            for (const file of reportFiles) {
                try {
                    const report = await this.aiService.extractPdfReportInsights(file, analysisPrompt);
                    extractedReports.push({
                        fileName: report.fileName,
                        markdown: report.aiSummary || report.reportSummary?.markdown || '',
                    });
                } catch (fileError: any) {
                    console.warn(`Skipping report file ${file.originalname}: ${fileError?.message || fileError}`);
                }
            }

            // Build comprehensive prompt for Gemini API
            const healthPrompt = `
You are a health insights AI. Your task is to generate personalized health insights based on the provided data.

IMPORTANT PRIORITY INSTRUCTION:
1. FIRST, thoroughly analyze the "Uploaded Medical Reports Summary" (if provided). The medical reports contain the actual, clinical problems and are your primary source of truth.
2. SECOND, review the "Manually Entered Health Profile Data" as secondary context to fill in lifestyle details (like sleep, diet, activity level) and general metrics (like height, weight, BMI).
3. FINALLY, generate the insights by combining both, ensuring the clinical findings from the reports take precedence.

Manually Entered Health Profile Data:
- Name: ${healthData.name}
- Age: ${healthData.age}
- Gender: ${healthData.gender}
- Height: ${healthData.heightCm} cm
- Weight: ${healthData.weightKg} kg
- BMI: ${healthData.bmi}
- Blood Group: ${healthData.bloodGroup || 'Not provided'}
- Medical History: ${healthData.medicalHistory || 'None'}
- Allergies: ${healthData.allergies || 'None'}
- Current Medications: ${healthData.currentMedications || 'None'}
- Sleep Hours: ${healthData.sleepHours || 'Not provided'}
- Activity Level: ${healthData.activityLevel || 'Not provided'}
- Diet Preference: ${healthData.dietPreference || 'Not provided'}
- Blood Reports: ${healthData.bloodReports || 'Not provided'}
- Vitamin D: ${healthData.vitaminD || 'Not provided'}
- Vitamin B12: ${healthData.vitaminB12 || 'Not provided'}
- Cholesterol: ${healthData.cholesterol || 'Not provided'}
- Fasting Sugar: ${healthData.fastingSugar || 'Not provided'}
- HbA1c: ${healthData.hba1c || 'Not provided'}

${extractedReports.length > 0 ? `Uploaded Medical Reports Summary (PRIMARY SOURCE OF TRUTH):\n${extractedReports.map((report, index) => `${index + 1}. ${report.fileName}\n${report.markdown}`).join('\n\n')}` : 'No medical reports were uploaded.'}

Generate the following as JSON with these exact keys based on the priority instructions above:
{
  "personalizedHealthReports": ["insight1", "insight2", ...],
  "nutritionInsights": ["insight1", "insight2", ...],
  "customDietGuidance": ["guidance1", "guidance2", ...],
  "fitnessSuggestions": ["suggestion1", "suggestion2", ...],
  "productRecommendations": ["product1", "product2", ...],
  "preventiveAlerts": ["alert1", "alert2", ...]
}

Provide concise, actionable insights specific to this person's combined health profile and report data.
            `;

            // Call Gemini API via AI service
            const aiResponse = await this.aiService.generateGeminiHealthInsights(healthPrompt);
            return aiResponse;
        } catch (error) {
            console.error('Error generating health insights:', error);
            return this.buildFallbackPersonalizedInsights(healthData);
        }
    }

    private buildFallbackPersonalizedInsights(healthData: any) {
        const healthScore = this.calculateFallbackHealthScore(healthData);
        const risks: string[] = [];
        const insights: string[] = [];

        if ((healthData.bmi ?? 0) >= 25) {
            risks.push('Weight management needed');
            insights.push('Improve diet quality, increase daily activity, and track weight trend over time.');
        }

        if ((healthData.fastingSugar ?? 0) >= 100 || (healthData.hba1c ?? 0) >= 5.7) {
            risks.push('Blood sugar risk');
            insights.push('Reduce added sugar and refined carbohydrates, and follow up with repeat glucose or HbA1c testing.');
        }

        if ((healthData.cholesterol ?? 0) >= 200) {
            risks.push('Cholesterol risk');
            insights.push('Focus on heart-healthy meals, regular exercise, and monitoring cholesterol trends.');
        }

        if ((healthData.vitaminD ?? 0) > 0 && (healthData.vitaminD ?? 0) < 30) {
            risks.push('Vitamin D insufficiency');
            insights.push('Increase vitamin D intake through food, sunlight, or supplementation as advised by a clinician.');
        }

        if ((healthData.sleepHours ?? 0) < 7) {
            risks.push('Sleep deficit');
            insights.push('Try to reach 7 to 9 hours of sleep with a consistent bedtime and wake-up schedule.');
        }

        return {
            personalizedHealthReports: [`Estimated health score: ${healthScore}/100`, ...insights.slice(0, 4)],
            nutritionInsights: [
                'Prefer whole foods, lean protein, vegetables, and enough hydration.',
                'Limit added sugar, fried food, and highly processed meals.',
            ],
            customDietGuidance: [
                'Keep portions controlled and balance carbs with protein and fiber.',
                'Use a consistent meal schedule to support blood sugar control.',
            ],
            fitnessSuggestions: [
                'Aim for at least 150 minutes of moderate activity each week.',
                'Include walking, strength training, and mobility work.',
            ],
            productRecommendations: [
                'Sugar-free or low-sugar food options',
                'Protein-rich snacks and fiber-rich foods',
            ],
            preventiveAlerts: risks.length > 0
                ? risks.map((risk) => `Monitor: ${risk}`)
                : ['Continue routine checkups and maintain your current healthy routine.'],
        };
    }

    private calculateFallbackHealthScore(healthData: any) {
        let score = 100;

        if ((healthData.bmi ?? 0) >= 30) score -= 15;
        else if ((healthData.bmi ?? 0) >= 25) score -= 10;

        if ((healthData.fastingSugar ?? 0) >= 126 || (healthData.hba1c ?? 0) >= 6.5) score -= 15;
        else if ((healthData.fastingSugar ?? 0) >= 100 || (healthData.hba1c ?? 0) >= 5.7) score -= 10;

        if ((healthData.cholesterol ?? 0) >= 240) score -= 10;
        else if ((healthData.cholesterol ?? 0) >= 200) score -= 5;

        if ((healthData.vitaminD ?? 0) > 0 && (healthData.vitaminD ?? 0) < 20) score -= 10;
        else if ((healthData.vitaminD ?? 0) >= 20 && (healthData.vitaminD ?? 0) < 30) score -= 5;

        if ((healthData.sleepHours ?? 0) > 0 && (healthData.sleepHours ?? 0) < 7) score -= 5;

        return Math.max(0, Math.min(100, score));
    }

    private mapCustomerResponse(customer: Customer) {
        return {
            id: customer.id,
            fullName: customer.fullName,
            email: customer.email,
            phone: customer.phone,
            dob: customer.dob,
            gender: customer.gender,
            goal: customer.goal,
            community: customer.community,
            landmark: customer.landmark,
            locality: customer.locality,
            userType: customer.userType,
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt,
        };
    }

    // ---------------------- VENDOR REGISTRATION ----------------------
    async registerVendor(dto: RegisterVendorDto) {
        const existingAuth = await this.authRepo.findOne({ where: { username: dto.username } });
        if (existingAuth) throw new BadRequestException('Username already exists');

        const userType = await this.userTypeRepo.findOne({ where: { typeName: 'Vendor' } });
        if (!userType) throw new BadRequestException('UserType "Vendor" not found');

        // Exclude categories from the create call as it expects Category entities, not IDs
        const { categories: categoryIds, ...vendorData } = dto.vendor;
        const vendor = this.vendorRepo.create({ ...vendorData, userType });

        // Fetch and assign categories separately if provided
        if (categoryIds && categoryIds.length > 0) {
            const categories = await this.categoriesRepo.findBy({ id: In(categoryIds) });
            vendor.categories = categories;
        }

        await this.vendorRepo.save(vendor);

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const auth = this.authRepo.create({ username: dto.username, password: hashedPassword, vendor });
        await this.authRepo.save(auth);

        return { message: 'Vendor registered successfully' };
    }

    // ---------------------- LOGIN ----------------------
    async login(dto: AuthDto) {
        const auth = await this.authRepo.findOne({
            where: { username: dto.username },
            relations: ['user', 'vendor', 'customer', 'user.userType', 'vendor.userType', 'customer.userType']
        });

        if (!auth) throw new UnauthorizedException('Invalid credentials');

        const isMatch = await bcrypt.compare(dto.password, auth.password);
        if (!isMatch) throw new UnauthorizedException('Invalid credentials');

        // Determine role
        let role = 'Unknown';
        let profileId: number | null = null;
        if (auth.user) {
            role = auth.user.userType.typeName;
            profileId = auth.user.id;
        } else if (auth.vendor) {
            role = auth.vendor.userType.typeName;
            profileId = auth.vendor.id;
        } else if (auth.customer) {
            role = auth.customer.userType.typeName;
            profileId = auth.customer.id;
        }

        const payload = { username: auth.username, sub: auth.id, role, profileId };
        const accessToken = this.jwtService.sign(payload);

        return { accessToken, role, profileId };
    }


    // async googleLogin(googleUser: {
    //     email: string;
    //     fullName: string;
    // }) {

    //     if (!googleUser || !googleUser.email) {
    //         throw new UnauthorizedException("Google login failed");
    //     }

    //     const email = googleUser.email;

    //     let customer = await this.customerRepo.findOne({
    //         where: { email }
    //     });

    //     // Create new if not found
    //     if (!customer) {
    //         customer = this.customerRepo.create({
    //             email: googleUser.email,
    //             fullName: googleUser.fullName,
    //             userType: { id: 2 } // customer role id
    //         });

    //         await this.customerRepo.save(customer);
    //     }

    //     // JWT payload structure
    //     const payload = {
    //         sub: customer.id,
    //         email: customer.email,
    //         role: "Customer"
    //     };

    //     // Use Nest JWT Service
    //     const token = this.jwtService.sign(payload);
    //     console.log(`freshwayz://google-register?email=${customer.email}&name=${customer.fullName}`);

    //     // return {
    //     //     url: `freshwayz://google-register?email=${customer.email}&name=${customer.fullName}`,
    //     // };
    //     // return `freshwayz://google-register?email=${encodeURIComponent(
    //     //     customer.email,
    //     // )}&name=${encodeURIComponent(customer.fullName)}`;
    //     return {
    //         message: "Login successful",
    //         accessToken: token,
    //         role: "Customer",
    //         profileId: customer.id,
    //         customer
    //     };
    // }

    async googleLogin(googleUser: { email: string; fullName: string }) {
        if (!googleUser || !googleUser.email) throw new UnauthorizedException();

        let customer = await this.customerRepo.findOne({ where: { email: googleUser.email } });
        if (!customer) {
            customer = this.customerRepo.create({
                email: googleUser.email,
                fullName: googleUser.fullName,
                userType: { id: 2 }
            });
            await this.customerRepo.save(customer);
        }

        const payload = { sub: customer.id, email: customer.email, role: "Customer" };
        const token = this.jwtService.sign(payload);

        // Build deep link for mobile
        const deepLink = `freshwayz://google-register?email=${encodeURIComponent(customer.email)}&name=${encodeURIComponent(customer.fullName)}&id=${encodeURIComponent(customer.id)}&token=${token}`;

        return deepLink; // <-- string for redirect
    }

    // (username:string){}
    async findOneCustomer(username: string) {
        // const auth = await this.customerRepo.findOne({
        //     where: { phone: username },
        //     // relations: ['customer',],
        //     // select: {
        //     //     customer: true,
        //     // },
        // });
        const auth = await this.customerRepo.findOne({
            where: [
                { phone: username },
                { email: ILike(username) },
            ],
        });
        if (!auth) throw new NotFoundException('Customer not found');
        return auth;
    }

    async findCustomer() {
        const customer = await this.customerRepo.find();

        if (!customer) throw new NotFoundException('Customer not found');
        return customer;
    }
}


// import { Injectable } from '@nestjs/common';
// import { CreateAuthDto } from './dto/create-auth.dto';
// import { UpdateAuthDto } from './dto/update-auth.dto';

// @Injectable()
// export class AuthService {
//   create(createAuthDto: CreateAuthDto) {
//     return 'This action adds a new auth';
//   }

//   findAll() {
//     return `This action returns all auth`;
//   }

//   findOne(id: number) {
//     return `This action returns a #${id} auth`;
//   }

//   update(id: number, updateAuthDto: UpdateAuthDto) {
//     return `This action updates a #${id} auth`;
//   }

//   remove(id: number) {
//     return `This action removes a #${id} auth`;
//   }
// }
