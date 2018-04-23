package de.bbgs.session;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;

import de.bbgs.utils.DBUtils;

public class AccountDBUtil
{

    public static Collection<AccountInfo> getAllAccounts(Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            Collection<AccountInfo> result = new ArrayList<>();
            
            stmt = conn.prepareStatement("select id, accountName from user_accounts order by accountName");
            rs = stmt.executeQuery();
            while (rs.next())
            {
                AccountInfo ai = new AccountInfo();
                ai.id = rs.getInt("id");
                ai.accountName = rs.getString("accountName");
                result.add(ai);
            }
            return result;
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }
}
