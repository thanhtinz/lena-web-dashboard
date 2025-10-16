import StickyMessagesConfig from '@/components/dashboard/StickyMessagesConfig';

export default async function StickyMessagesPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  return <StickyMessagesConfig serverId={id} />;
}
