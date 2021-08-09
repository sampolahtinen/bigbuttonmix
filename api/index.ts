export default function (req, res) {
  const { name = 'World' } = req.query;
  console.log('moi')
  res.send(`Hello ${name}!`);
}