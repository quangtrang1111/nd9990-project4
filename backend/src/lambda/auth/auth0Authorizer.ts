import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth/auth0Authorizer')

const cert = `-----BEGIN CERTIFICATE-----
MIIDEzCCAfugAwIBAgIJd90yN8gfn5PNMA0GCSqGSIb3DQEBCwUAMCcxJTAjBgNV
BAMTHHF1YW5ndHJhbmcxMTExMS5ldS5hdXRoMC5jb20wHhcNMjIwMzIwMDgyMjMx
WhcNMzUxMTI3MDgyMjMxWjAnMSUwIwYDVQQDExxxdWFuZ3RyYW5nMTExMTEuZXUu
YXV0aDAuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr8CQu9bW
hctMmABTWZ7GSwjQkLzavCSnauriV0FGuX9QN+CbLS3Cb7tOR12FfdKLBpAKXUTu
TOm+iT3yoRxQ9L8JSYojWG6qO5nhoDMLpsv/MU+todbohGhrK1IgskpGD2yry5di
rutyvEGEGG6x9tvJgvU8pOCwUgMgjK4H5MNDSu0vKH+RvMpGgVd92Wf0MOMVtf6Z
P3eJeMkVHnywsxTpj8aVrfKgmc6w5D7U7LCYHn3Z7BXZZFuU865JhnQqtt9zpHA4
Q3T1PD+9azOiZQvlqZkUpsBjKxZTjwTDamvxVFVlNucjqdacDhh3JfSE6oMV7PGV
xWL1SLQvKYXBpQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBRd
aHMMOXoAzsuldODhJ0Dm4fpxLDAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQEL
BQADggEBAAoxxDNsLPyoR8thNGOGwp7dgiJb3DlKY1f06diOESE2Ly8aPuzRAjzN
YK43WwH2zZ4Qxtd0wpYFS4f9sEBG4WSn6hycahJpslV4ycSmFuqQaUK6HT+aZLC5
QXOYUu/yAJP+iog9b97ij2aIIsTiJ7ouMCqmKfGi1tMGbP4ShN9qJeTVpQ55OCIa
YgHAK0HAWBkvo+hagcytgFJIg4xKTZ8jp9f4i5ESkBWNNvXYiWNMz2L3O4Lc2luh
O1RrlK6YfiO5EJVu7ltP7KnBdalG235OCset3S4hLhSXZxTzJlelswvZgeMqcuOe
9laD6MuxKe9T7jr4NkBEEIPFjIRxlKY=
-----END CERTIFICATE-----`

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  let jwtToken: JwtPayload;

  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('Authorized a user', { token: event.authorizationToken, jwtToken})
  } catch (error: any) {
    logger.error('An user is not authorized', { error: error.message })
  }

  return {
    principalId: jwtToken?.sub,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: '*'
        }
      ]
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) {
    throw new Error('No authentication header')
  }

  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    throw new Error('Invalid authentication header')
  }

  const split = authHeader.split(' ')

  return split[1]
}
