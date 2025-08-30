import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Удаляет нежелательные свойства
      forbidNonWhitelisted: true, // Бросает ошибку при наличии нежелательных свойств
      transform: true, // Автоматическое преобразование типов
      disableErrorMessages: false, // Включить сообщения об ошибках
    }),
  );

  app.setGlobalPrefix('api');

  // CORS configuration for development
  const corsOptions = {
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://vetguide.space', 'https://www.vetguide.space']
        : true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };

  app.enableCors(corsOptions);

  // Add security headers to handle strict origin policy
  app.use((req, res, next) => {
    // Set security headers
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    }

    next();
  });

  // Log CORS configuration in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('🌐 CORS enabled with origins:', corsOptions.origin);
    console.log('🔒 Security headers configured for development');
  }

  // Only enable Swagger in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    console.log('🚀 Swagger enabled in non-production mode');

    const config = new DocumentBuilder()
      .addGlobalResponse({
        status: 403,
        description: 'Forbidden',
      })
      .addGlobalResponse({
        status: 401,
        description: 'Unauthorized',
      })
      .setTitle('Vetguide API')
      .setDescription('API приложения Ветгид')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth', // This name here is important for @ApiBearerAuth() decorator
      )
      .addTag('Авторизация', 'Authentication endpoints')
      .addTag('Пользователь', 'User management endpoints')
      .addTag('Врачи', 'Doctor management endpoints')
      .addTag('Ветклиники', 'Veterinary clinic management endpoints')
      .addTag('Отзывы', 'Review management endpoints')
      .addTag('Поиск', 'Search functionality endpoints')
      .addTag('S3', 'Image storage and management endpoints')
      .addTag('Админ', 'Administrative endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      operationIdFactory: (controllerKey: string, methodKey: string) =>
        methodKey,
    });

    // Swagger UI endpoint
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        showRequestHeaders: true,
        showExtensions: true,
      },
    });

    // Swagger JSON endpoint for type generation
    app.use('/api-json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS',
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization',
      );
      res.send(document);
    });

    // Alternative endpoint with .json extension
    app.use('/swagger.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS',
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization',
      );
      res.send(document);
    });
  } else {
    console.log(
      `🔒 Swagger disabled in ${process.env.NODE_ENV || 'production'} mode`,
    );
  }

  await app.listen(3001);
}
bootstrap();
