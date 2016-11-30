import {Router} from 'express';
import uuidGenerator from 'uuid-support';

const router = new Router();

router.get('/sites', (req, res) => {
  res.send([
    {id: uuidGenerator.generate(), siteName: 'My Supercool Site'},
    {id: uuidGenerator.generate(), siteName: 'My Other Supercool Site'}
  ]);
});

module.exports = router;
