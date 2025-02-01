import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const useGetSocketMessage = () => {
  const socket = useSelector((state) => state.socket.socket);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!socket) return;

    return () => {
      socket.off("newMessage");
    };
<<<<<<< HEAD
  }, [socket, dispatch]);
=======
  }, [socket, dispatch]); // Remove messages dependency
>>>>>>> 261f566fc3cb19e69f31df7b0f15d4b5131ef71f
};

export default useGetSocketMessage;