import ReactionRoleDetail from '@/components/dashboard/ReactionRoleDetail';

export default async function ReactionRoleDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string; messageId: string }> 
}) {
  const { id, messageId } = await params;
  
  return <ReactionRoleDetail serverId={id} messageId={messageId} />;
}
