export default eventHandler(async event => {
  console.info(event)
  const data = await readBody(event)

  console.info('envoi du formulaire', data)
  return { data }
})