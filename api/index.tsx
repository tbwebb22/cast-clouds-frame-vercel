import { Button, Frog } from 'frog';
import { devtools } from 'frog/dev';
import { serveStatic } from 'frog/serve-static';
import { handle } from 'frog/vercel';
import { baseSepolia } from 'viem/chains'; 
import imageMap from '../utils/imageMap.js';
import { abi } from '../utils/abi.js';

export const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
})

const castCloudsAddress='0xc33D61f88f207D2c1E3E2e90cF389F9bfCb25C2a';

app.frame('/home/:id', (c) => {
  const id = c.req.param('id');

  console.log("start token ", id);

  return c.res({
    action: `/finish/${id}`,
    image: imageMap[id],
    imageAspectRatio: '1:1',
    intents: [
      <Button.Transaction target={`/mint/${id}`}>Mint</Button.Transaction>,
    ],
  });
});

app.transaction('/mint/:id', (c) => {
  const id = c.req.param('id');

  console.log("minting token ", id);

  return c.contract({
    abi,
    chainId: `eip155:${baseSepolia.id}`,
    functionName: 'mint',
    args: [BigInt(id)],
    to: castCloudsAddress,
  });
});

app.frame('/finish/:id', (c) => {
  const id = c.req.param('id');

  return c.res({
    image: (
      <div style={{
        color: 'white', 
        display: 'flex', 
        justifyContent: 'center', // Centers content horizontally
        alignItems: 'center', // Centers content vertically
        fontSize: '30px', 
        height: '100%', // Make sure the div takes full height of its container
        width: '100%', // Make sure the div takes full width of its container
        backgroundColor: 'black', // Background color for visibility
        flexDirection: 'column', // Stack children vertically
        textAlign: 'center', // Center text lines horizontally
      }}>
        Minted!
        <br />
        Follow the /cast-clouds<br />channel for more free mints
      </div>
    ),
    imageAspectRatio: '1:1',
    intents: [
      <Button.Link href="https://warpcast.com/~/channel/cast-clouds">/cast-clouds</Button.Link>,
      <Button.Link href={`https://testnets.opensea.io/assets/base-sepolia/${castCloudsAddress}/${id}`}>View on OpenSea</Button.Link>,
    ]
  });
});

// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined'
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development'
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
