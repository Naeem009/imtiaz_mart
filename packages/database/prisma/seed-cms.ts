import { PrismaClient } from "@prisma/client";
import { v7 as uuidv7 } from "uuid";

export async function seedCms(prisma: PrismaClient) {
  const pages = [
    {
      slug: "about",
      title: "About ATVOO",
      excerpt: "Pakistan's premium multi-vendor marketplace.",
      body: "ATVOO is a premium multi-vendor marketplace connecting trusted sellers with shoppers across Pakistan. We focus on authentic products, fast delivery, and a reliable checkout experience.",
    },
    {
      slug: "privacy",
      title: "Privacy Policy",
      excerpt: "How we collect and use your data.",
      body: "We collect account, order, and device information to operate the marketplace. We do not sell personal data. Payment card numbers are never stored in full — only tokenized last-four digits when you save a method.",
    },
    {
      slug: "terms",
      title: "Terms & Conditions",
      excerpt: "Marketplace terms for buyers and sellers.",
      body: "By using ATVOO you agree to our marketplace rules, vendor policies, and acceptable-use standards. Vendors are responsible for listing accuracy. Buyers must provide truthful delivery details.",
    },
    {
      slug: "shipping",
      title: "Shipping Policy",
      excerpt: "Delivery timelines and shipping fees.",
      body: "Orders over PKR 2,999 ship free. Standard shipping is PKR 250. Delivery windows depend on vendor location and courier availability.",
    },
    {
      slug: "refund",
      title: "Refund Policy",
      excerpt: "How refunds and returns work.",
      body: "Eligible items can be returned after shipping. Open a return from your account. Refunds are issued to the original payment method after the return is received and approved.",
    },
    {
      slug: "help",
      title: "Help Center",
      excerpt: "Get support for orders, payments, and returns.",
      body: "Track orders from your account, request returns after shipment, and contact support if a payment does not capture. Demo support: support is handled in-app for local development.",
    },
    {
      slug: "contact",
      title: "Contact",
      excerpt: "Reach the ATVOO team.",
      body: "Email hello@atvoo.local or use your account dashboard. Vendors can reach marketplace ops from the vendor portal.",
    },
    {
      slug: "careers",
      title: "Careers",
      excerpt: "Build commerce infrastructure with us.",
      body: "We are not listing open roles in this demo environment. Check back as the marketplace grows.",
    },
  ];

  for (const page of pages) {
    await prisma.cmsPage.upsert({
      where: { slug: page.slug },
      update: page,
      create: { id: uuidv7(), ...page, status: "PUBLISHED" },
    });
  }

  const faqs = [
    {
      question: "How do I track my order?",
      answer: "Open Account → Orders, or use Track Order with your order number.",
      category: "orders",
    },
    {
      question: "Which payment methods are supported?",
      answer: "Cash on delivery, card, JazzCash, EasyPaisa, and bank transfer.",
      category: "payments",
    },
    {
      question: "How do reward points work?",
      answer: "You earn 1 point per PKR 100 paid. Points can cover up to 20% of an order subtotal.",
      category: "loyalty",
    },
    {
      question: "How does the affiliate program work?",
      answer: "Register from the Affiliate page, share your referral link, and earn 5% commission on attributed orders.",
      category: "affiliate",
    },
  ];

  const existingFaqs = await prisma.faq.count();
  if (existingFaqs === 0) {
    for (const [index, faq] of faqs.entries()) {
      await prisma.faq.create({
        data: { id: uuidv7(), ...faq, sortOrder: index },
      });
    }
  }

  const existingPost = await prisma.blogPost.findUnique({ where: { slug: "welcome-to-atvoo" } });
  if (!existingPost) {
    await prisma.blogPost.create({
      data: {
        id: uuidv7(),
        title: "Welcome to ATVOO",
        slug: "welcome-to-atvoo",
        excerpt: "A premium marketplace built for trusted local commerce.",
        body: "ATVOO brings vendors and shoppers together with verified stores, visual search, and agent-ready product feeds.",
        published: true,
        publishedAt: new Date(),
      },
    });
  }

  console.log("Seeded CMS pages, FAQs, and blog");
}
