import { google, gmail_v1 } from 'googleapis';

export class GmailService {
  private gmail: gmail_v1.Gmail;

  constructor() {
    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error('Gmail API credentials are not fully configured in environment variables.');
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'https://developers.google.com/oauthplayground' // Redirect URI used to get the token
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    this.gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  }

  /**
   * Busca a lista de mensagens que correspondem a uma query específica (sem baixar o corpo).
   */
  async listMessages(query: string) {
    const response = await this.gmail.users.messages.list({
      userId: 'me',
      q: query,
    });
    return response.data.messages || [];
  }

  /**
   * Baixa os detalhes completos de uma mensagem pelo ID.
   */
  async getMessageDetails(id: string) {
    const detail = await this.gmail.users.messages.get({
      userId: 'me',
      id: id,
    });
    return detail.data;
  }

  /**
   * Baixa o anexo PDF de uma mensagem.
   */
  async getPdfAttachment(messageId: string, messagePayload: gmail_v1.Schema$MessagePart): Promise<Buffer | null> {
    const parts = messagePayload.parts || [];
    
    // Procura recursivamente pelo anexo PDF
    let attachmentId: string | null = null;
    
    const findAttachment = (partsList: gmail_v1.Schema$MessagePart[]) => {
      for (const part of partsList) {
        if (part.mimeType === 'application/pdf' && part.body?.attachmentId) {
          attachmentId = part.body.attachmentId;
          return;
        }
        if (part.parts) {
          findAttachment(part.parts);
        }
      }
    };
    
    findAttachment(parts);

    if (!attachmentId) {
      return null;
    }

    const attachment = await this.gmail.users.messages.attachments.get({
      userId: 'me',
      messageId: messageId,
      id: attachmentId,
    });

    if (attachment.data.data) {
      // Retorna o buffer decodificado
      return Buffer.from(attachment.data.data, 'base64');
    }

    return null;
  }

  /**
   * Marca a mensagem como lida removendo a label UNREAD.
   */
  async markAsRead(messageId: string) {
    await this.gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        removeLabelIds: ['UNREAD'],
      },
    });
  }
}
