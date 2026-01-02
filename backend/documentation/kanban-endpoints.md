# API Endpoints - Gestión de Candidatos en Flujo Kanban

Este documento describe los endpoints REST implementados para la gestión de candidatos en un flujo de proceso tipo Kanban.

---

## 1. Obtener Candidatos por Posición

### Descripción
Obtiene todos los candidatos que están en proceso para una posición específica, incluyendo su etapa actual y promedio de scores de entrevistas.

### Endpoint
```
GET /positions/:id/candidates
```

### Parámetros de URL
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | number | ID de la posición |

### Respuesta Exitosa (200 OK)

#### Estructura
```json
{
  "message": "Candidates retrieved successfully",
  "data": [
    {
      "candidateId": number,
      "fullName": string,
      "current_interview_step": string,
      "average_score": number | null
    }
  ]
}
```

#### Ejemplo
```json
{
  "message": "Candidates retrieved successfully",
  "data": [
    {
      "candidateId": 1,
      "fullName": "Juan Pérez",
      "current_interview_step": "Entrevista Técnica",
      "average_score": 85.5
    },
    {
      "candidateId": 2,
      "fullName": "María García",
      "current_interview_step": "Entrevista RRHH",
      "average_score": 92.0
    },
    {
      "candidateId": 3,
      "fullName": "Carlos López",
      "current_interview_step": "Screening Inicial",
      "average_score": null
    }
  ]
}
```

### Respuestas de Error

#### 400 Bad Request
```json
{
  "error": "Invalid ID format"
}
```

#### 404 Not Found
```json
{
  "error": "Position not found"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal Server Error"
}
```

### Códigos HTTP
- `200`: Éxito - Candidatos obtenidos correctamente
- `400`: Error de validación - ID inválido
- `404`: Posición no encontrada
- `500`: Error interno del servidor

### Ejemplos CURL

#### Ejemplo 1: Obtener candidatos de la posición 1
```bash
curl -X GET http://localhost:3010/positions/1/candidates \
  -H "Content-Type: application/json"
```

#### Ejemplo 2: Obtener candidatos de la posición 5
```bash
curl -X GET http://localhost:3010/positions/5/candidates \
  -H "Content-Type: application/json"
```

### Notas
- El campo `average_score` será `null` si el candidato no tiene entrevistas registradas o si ninguna entrevista tiene score asignado
- El campo `current_interview_step` muestra el nombre de la etapa actual del proceso
- Los candidatos se retornan en el orden en que fueron agregados a la posición

---

## 2. Actualizar Etapa del Candidato

### Descripción
Actualiza la etapa actual (`current_interview_step`) de un candidato en su aplicación a una posición específica, permitiendo moverlo a través del flujo Kanban.

### Endpoint
```
PUT /candidates/:id/stage
```

### Parámetros de URL
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | number | ID del candidato |

### Body (JSON)
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| applicationId | number | Sí | ID de la aplicación a actualizar |
| newStepId | number | Sí | ID de la nueva etapa (InterviewStep) |

#### Ejemplo
```json
{
  "applicationId": 10,
  "newStepId": 3
}
```

### Respuesta Exitosa (200 OK)

#### Estructura
```json
{
  "message": "Candidate stage updated successfully",
  "data": {
    "id": number,
    "firstName": string,
    "lastName": string,
    "email": string,
    "phone": string | null,
    "address": string | null,
    "education": [],
    "workExperience": [],
    "resumes": [],
    "applications": []
  }
}
```

#### Ejemplo
```json
{
  "message": "Candidate stage updated successfully",
  "data": {
    "id": 5,
    "firstName": "Ana",
    "lastName": "Martínez",
    "email": "ana.martinez@example.com",
    "phone": "555-0123",
    "address": "Calle Principal 123",
    "education": [],
    "workExperience": [],
    "resumes": [],
    "applications": [
      {
        "id": 10,
        "positionId": 2,
        "candidateId": 5,
        "applicationDate": "2024-01-15T10:00:00.000Z",
        "currentInterviewStep": 3,
        "notes": "Candidato promisorio",
        "position": {
          "id": 2,
          "title": "Senior Backend Developer"
        },
        "interviews": []
      }
    ]
  }
}
```

### Respuestas de Error

#### 400 Bad Request - ID inválido
```json
{
  "error": "Invalid candidate ID format"
}
```

#### 400 Bad Request - Campos faltantes
```json
{
  "error": "applicationId and newStepId are required"
}
```

#### 400 Bad Request - Tipos inválidos
```json
{
  "error": "applicationId and newStepId must be numbers"
}
```

#### 400 Bad Request - Aplicación no corresponde al candidato
```json
{
  "error": "Application does not belong to this candidate"
}
```

#### 404 Not Found - Candidato no existe
```json
{
  "error": "Candidate not found"
}
```

#### 404 Not Found - Aplicación no existe
```json
{
  "error": "Application not found"
}
```

#### 404 Not Found - Etapa no existe
```json
{
  "error": "Interview step not found"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal Server Error"
}
```

### Códigos HTTP
- `200`: Éxito - Etapa actualizada correctamente
- `400`: Error de validación - Parámetros inválidos o faltantes
- `404`: Recurso no encontrado (candidato, aplicación o etapa)
- `500`: Error interno del servidor

### Ejemplos CURL

#### Ejemplo 1: Mover candidato a etapa de "Entrevista Técnica"
```bash
curl -X PUT http://localhost:3010/candidates/5/stage \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": 10,
    "newStepId": 3
  }'
```

#### Ejemplo 2: Mover candidato a etapa de "Entrevista Final"
```bash
curl -X PUT http://localhost:3010/candidates/8/stage \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": 15,
    "newStepId": 5
  }'
```

### Notas
- Es necesario proporcionar tanto el `applicationId` como el `newStepId`
- El `applicationId` debe corresponder a una aplicación del candidato especificado
- El `newStepId` debe ser un ID válido de una etapa existente en la tabla `InterviewStep`
- Un candidato puede tener múltiples aplicaciones a diferentes posiciones, por lo que es importante especificar cuál aplicación actualizar
- La respuesta incluye toda la información del candidato actualizada, incluyendo sus aplicaciones con las relaciones correspondientes

---

## Consideraciones Generales

### Base URL
```
http://localhost:3010
```

### Headers Comunes
Todos los endpoints requieren:
```
Content-Type: application/json
```

### CORS
El backend está configurado para aceptar peticiones desde:
```
http://localhost:3000
```

### Validaciones
- Todos los IDs deben ser números enteros válidos
- Los campos requeridos en el body deben estar presentes
- Las relaciones entre entidades (candidato-aplicación, aplicación-etapa) se validan antes de realizar actualizaciones

### Manejo de Errores
Todos los endpoints implementan un manejo consistente de errores con:
- Códigos HTTP apropiados
- Mensajes de error descriptivos en formato JSON
- Validación de tipos y formatos de datos

---

## Modelo de Datos Relacionado

### Application
```typescript
{
  id: number;
  positionId: number;
  candidateId: number;
  applicationDate: Date;
  currentInterviewStep: number;  // FK a InterviewStep
  notes?: string;
}
```

### Interview
```typescript
{
  id: number;
  applicationId: number;
  interviewStepId: number;
  employeeId: number;
  interviewDate: Date;
  result?: string;
  score?: number;  // Usado para calcular average_score
  notes?: string;
}
```

### InterviewStep
```typescript
{
  id: number;
  interviewFlowId: number;
  interviewTypeId: number;
  name: string;  // Nombre mostrado en current_interview_step
  orderIndex: number;
}
```

---

## Testing

### Flujo de Prueba Recomendado

1. **Crear datos de prueba** (posición, candidatos, aplicaciones, etapas)
2. **Obtener candidatos de una posición**
   ```bash
   curl -X GET http://localhost:3010/positions/1/candidates
   ```
3. **Verificar la respuesta** (candidatos con sus etapas y scores)
4. **Actualizar etapa de un candidato**
   ```bash
   curl -X PUT http://localhost:3010/candidates/5/stage \
     -H "Content-Type: application/json" \
     -d '{"applicationId": 10, "newStepId": 3}'
   ```
5. **Volver a obtener candidatos** para verificar la actualización

### Casos de Prueba

#### Caso 1: Posición sin candidatos
```bash
curl -X GET http://localhost:3010/positions/999/candidates
# Esperado: 404 - Position not found
```

#### Caso 2: Candidato con múltiples entrevistas
```bash
curl -X GET http://localhost:3010/positions/1/candidates
# Esperado: average_score calculado correctamente
```

#### Caso 3: Actualizar con applicationId incorrecto
```bash
curl -X PUT http://localhost:3010/candidates/5/stage \
  -H "Content-Type: application/json" \
  -d '{"applicationId": 999, "newStepId": 3}'
# Esperado: 404 - Application not found
```

#### Caso 4: Actualizar con etapa inexistente
```bash
curl -X PUT http://localhost:3010/candidates/5/stage \
  -H "Content-Type: application/json" \
  -d '{"applicationId": 10, "newStepId": 999}'
# Esperado: 404 - Interview step not found
```

---

## Changelog

### Versión 1.0.0 (2025-01-02)
- Implementación inicial de endpoints de gestión Kanban
- GET /positions/:id/candidates
- PUT /candidates/:id/stage
- Documentación completa con ejemplos

