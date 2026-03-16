import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import expressBasicAuth from 'express-basic-auth';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express'; // ✅ Import this

async function bootstrap() {
  // ✅ Cast app as NestExpressApplication
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Class Serializer Interceptor
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Swagger Auth
  app.use(
    ['/api/docs'],
    expressBasicAuth({
      users: {
        [process.env.SWAGGER_USER || 'admin']:
          process.env.SWAGGER_PASSWORD || 'supersecret',
      },
      challenge: true,
    }),
  );

  // Swagger Config
  const config = new DocumentBuilder()
    .setTitle('Auth API')
    .setDescription('JWT Authentication API with MySQL')
    .setVersion('1.0')
    .setContact(
      'Nilesh Choubisa',
      'https://example.com',
      'nilesh0109choubisa@gmail.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .setTermsOfService('https://example.com/terms')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  // ✅ Static uploads folder
  // app.useStaticAssets(join(__dirname, '..', 'uploads'), {
  //   prefix: '/uploads',
  // });

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();

// import { NestFactory, Reflector } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import expressBasicAuth from 'express-basic-auth';
// import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
// import { join } from 'path';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   app.enableCors({
//     origin: '*',
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
//     allowedHeaders: '*',
//     credentials: true,
//   });

//   // 👉 Needed for class-transformer serialization
//   app.useGlobalPipes(
//     new ValidationPipe({
//       transform: true,
//       whitelist: true,
//     })
//   );

//   // 👉 Very important: enables @Exclude() and prevents circular JSON
//   app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

//   // Swagger Auth
//   app.use(
//     ['/api/docs'],
//     expressBasicAuth({
//       users: {
//         [process.env.SWAGGER_USER || 'admin']:
//           process.env.SWAGGER_PASSWORD || 'supersecret',
//       },
//       challenge: true,
//     }),
//   );

//   // Swagger Config
//   const config = new DocumentBuilder()
//     .setTitle('Auth API')
//     .setDescription('JWT Authentication API with MySQL')
//     .setVersion('1.0')
//     .setContact(
//       'Nilesh Choubisa',
//       'https://example.com',
//       'nilesh0109choubisa@gmail.com'
//     )
//     .setLicense('MIT', 'https://opensource.org/licenses/MIT')
//     .setTermsOfService('https://example.com/terms')
//     .addBearerAuth()
//     .build();

//   const document = SwaggerModule.createDocument(app, config);
//   SwaggerModule.setup('api/docs', app, document, {
//     swaggerOptions: { persistAuthorization: true },
//   });
  
//   app.useStaticAssets(join(__dirname, '..', 'uploads'), {
//     prefix: '/uploads',
//   });

//   await app.listen(process.env.PORT ?? 5000);
// }
// bootstrap();
