# Vocali Backend

API serverless para transcripción de audio desarrollada con Serverless Framework y AWS.

## Variables de Entorno

Configurar las siguientes variables:
```bash
SPEECHMATICS_API_KEY=tu-speechmatics-api-key
```

## Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar tests
npm test

# Deploy a AWS
serverless deploy --stage dev
```

## Servicios AWS

- **Lambda Functions**: Endpoints de la API
- **API Gateway**: Manejo de rutas HTTP
- **DynamoDB**: Base de datos de usuarios y transcripciones
- **Cognito**: Autenticación de usuarios
