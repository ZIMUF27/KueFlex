const base = process.env.BASE_URL || 'http://localhost:3000'
const email = process.argv[2] || 'somchai@mail.com'
const password = process.argv[3] || '123456'

function parseSetCookie(response) {
  const raw = response.headers.get('set-cookie') || ''
  if (!raw) return []
  return raw
    .split(/,\s*(?=next-auth\.)/)
    .map(x => x.split(';')[0])
    .filter(Boolean)
}

async function main() {
  const csrfRes = await fetch(`${base}/api/auth/csrf`)
  const csrfBody = await csrfRes.json()
  const csrfToken = csrfBody.csrfToken
  let cookieJar = parseSetCookie(csrfRes)

  const params = new URLSearchParams({
    email,
    password,
    csrfToken,
    callbackUrl: `${base}`,
  })

  const callbackRes = await fetch(`${base}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: cookieJar.join('; '),
    },
    redirect: 'manual',
    body: params.toString(),
  })

  cookieJar = [...cookieJar, ...parseSetCookie(callbackRes)]

  const sessionRes = await fetch(`${base}/api/auth/session`, {
    headers: {
      Cookie: cookieJar.join('; '),
    },
  })

  const sessionBody = await sessionRes.text()

  console.log('email', email)
  console.log('callbackStatus', callbackRes.status)
  console.log('callbackLocation', callbackRes.headers.get('location'))
  console.log('callbackSetCookie', (callbackRes.headers.get('set-cookie') || '').length)
  console.log('sessionStatus', sessionRes.status)
  console.log('sessionBody', sessionBody)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
