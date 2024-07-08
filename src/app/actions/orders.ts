// 'use server';

// import db from '@/db/db';

// // To check if a user already has previously placed an order from us
// export async function userOrderExists(
//   email: string,
//   productId: string
// ): Promise<boolean> {
//   return (
//     (await db.order.findFirst({
//       where: { user: { email }, productId },
//       select: { id: true },
//     })) !== null
//   );
// }
