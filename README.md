Our dApp leverages the ERC-4337 specification to provide users with highly customizable, no-code smart wallets. We've developed reliable modules with specialized logic, allowing users to assemble their desired wallet effortlessly. These modules are built using Safe plugins, enabling the integration of multiple plugins within a single smart wallet.

For an intuitive setup experience, our modules are configured through a conversational interface powered by the OpenAI API. It's important to note that while the AI assists in selecting and applying plugins and parameters, it does not generate code. We prioritize reliability and trustworthiness in our codebase, hence our decision to manually craft the plugins, with the AI primarily assisting with plugin suggestions rather than plugin generation.

The client-side of our application is built using Next.js, and the Safe SDK for Account Abstraction. Wallet connectivity is facilitated by Web3Auth, which incorporates social authentication for enhanced access and security.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Front end and design

An extensive detail of the design roadmap can be found [here](https://www.figma.com/file/PknHeh0O0sEvKpYRMhJ0QR/Kandinsky---ETH-Global-Hackathon?type=design&node-id=13%3A1991&mode=design&t=G1llCpCXW0oiCect-1)

- NextJS Docs can be found [here](https://nextjs.org/docs)

## Foundry

For deploying the contracts, go into the `contracts` folder to read the `Foundry` commands
