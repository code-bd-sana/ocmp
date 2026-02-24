/**
 * Type definition for a participant.
 */
export type TParticipant = {
  firstName: string;
  lastName: string;
  role: string;
  employmentStatus: boolean;
  standAloneId?: string;
  createdBy: string;
};

/**
 * Type definition for a participant role.
 */
export type TParticipantRole = {
  roleName: string;
  standAloneId?: string;
  createdBy: string;
};