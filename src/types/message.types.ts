export interface ISendMessageDto {
    receiverUserName: string;
    text: string;
  }
  
  export interface IMessageDto extends ISendMessageDto {
    id: number;
    senderUserName: string;
    createdAt: string;
    type?: string; // RESET_PASSWORD_REQUEST, GENERAL
    status?: string; // NEW, DONE
  }
  