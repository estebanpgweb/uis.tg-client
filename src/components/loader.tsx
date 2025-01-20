const Loader = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="animate-spin rounded-full h-24 w-24 border-t-8 border-b-8 border-white"></div>
    </div>
  );
};

export default Loader;
