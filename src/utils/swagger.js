import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TapTalk.app API Documentation',
      version: '1.0.0',
      description: 'API documentation for TapTalk messaging application',
      contact: {
        name: 'TapTalk Support',
        email: 'mshamel460@gmail.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.taptalk.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for authentication'
        },
        SystemAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'System JWT token for admin authentication'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            firstName: {
              type: 'string',
              description: 'User first name',
              minLength: 3,
              maxLength: 20
            },
            lastName: {
              type: 'string',
              description: 'User last name',
              minLength: 3,
              maxLength: 20
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            phone: {
              type: 'string',
              description: 'Encrypted phone number'
            },
            gender: {
              type: 'string',
              enum: ['male', 'female'],
              description: 'User gender'
            },
            isVerified: {
              type: 'boolean',
              description: 'Email verification status'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'User role'
            },
            profilePicture: {
              type: 'object',
              properties: {
                public_id: { type: 'string' },
                secure_url: { type: 'string' }
              }
            },
            coverPicture: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  public_id: { type: 'string' },
                  secure_url: { type: 'string' }
                }
              }
            },
            provider: {
              type: 'string',
              enum: ['system', 'google'],
              description: 'Authentication provider'
            },
            deletedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account freeze timestamp'
            }
          }
        },
        Message: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Message ID'
            },
            content: {
              type: 'string',
              description: 'Message content',
              minLength: 1,
              maxLength: 1000
            },
            attachments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  public_id: { type: 'string' },
                  secure_url: { type: 'string' }
                }
              }
            },
            senderId: {
              type: 'string',
              description: 'Sender user ID'
            },
            receiverId: {
              type: 'string',
              description: 'Receiver user ID'
            },
            isRead: {
              type: 'boolean',
              description: 'Message read status'
            },
            isDeleted: {
              type: 'boolean',
              description: 'Message deletion status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            error: {
              type: 'string',
              description: 'Error details'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Success message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  apis: [
    './src/modules/auth/auth.controller.js',
    './src/modules/user/user.controller.js',
    './src/modules/massage/massage.controller.js'
  ]
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
