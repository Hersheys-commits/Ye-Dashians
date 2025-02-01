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
  }, [socket, dispatch]);
};

export default useGetSocketMessage;