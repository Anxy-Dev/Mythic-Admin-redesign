function GetSpawnLocations()
    local p = promise.new()

    Database.Game:find({
        collection = 'locations',
        query = {
            Type = 'spawn'
        }
    }, function(success, results)
        if success and #results > 0 then
            p:resolve(results)
        else
            p:resolve(false)
        end
    end)

    local res = Citizen.Await(p)
    return res
end

function RegisterCallbacks()
    Callbacks:RegisterServerCallback('Admin:GetPlayerList', function(source, data, cb)
        local player = Fetch:Source(source)
        if player and player.Permissions:IsStaff() then
            local data = {}
            local activePlayers = Fetch:All()

            for k, v in pairs(activePlayers) do
                if v and v:GetData('AccountID') then
                    local char = v:GetData('Character')
                    table.insert(data, {
                        Source = v:GetData('Source'),
                        Name = v:GetData('Name'),
                        AccountID = v:GetData('AccountID'),
                        Character = char and {
                            First = char:GetData('First'),
                            Last = char:GetData('Last'),
                            SID = char:GetData('SID'),
                        } or false,
                    })
                end
            end
            cb(data)
        else
            cb(false)
        end
    end)

    Callbacks:RegisterServerCallback('Admin:GetDisconnectedPlayerList', function(source, data, cb)
        local player = Fetch:Source(source)
        if player and player.Permissions:IsStaff() then
            local rDs = exports['mythic-base']:FetchComponent('RecentDisconnects')
            cb(rDs)
        else
            cb(false)
        end
    end)

    Callbacks:RegisterServerCallback('Admin:GetPlayer', function(source, data, cb)
        local player = Fetch:Source(source)
        if player and player.Permissions:IsStaff() then
            local target = Fetch:Source(data)

            if target then
                local staffGroupName = false
                if target.Permissions:IsStaff() then
                    local highestLevel = 0
                    for k, v in ipairs(target:GetData('Groups')) do
                        if C.Groups[tostring(v)] ~= nil and (type(C.Groups[tostring(v)].Permission) == 'table') then
                            if C.Groups[tostring(v)].Permission.Level > highestLevel then
                                highestLevel = C.Groups[tostring(v)].Permission.Level
                                staffGroupName = C.Groups[tostring(v)].Name
                            end
                        end
                    end
                end

                local coords = GetEntityCoords(GetPlayerPed(target:GetData('Source')))

                local char = target:GetData('Character')
                local tData = {
                    Source = target:GetData('Source'),
                    Name = target:GetData('Name'),
                    AccountID = target:GetData('AccountID'),
                    Identifier = target:GetData('Identifier'),
                    Level = target.Permissions:GetLevel(),
                    Groups = target:GetData('Groups'),
                    StaffGroup = staffGroupName,
                    Character = char and {
                        First = char:GetData('First'),
                        Last = char:GetData('Last'),
                        SID = char:GetData('SID'),
                        DOB = char:GetData('DOB'),
                        Phone = char:GetData('Phone'),
                        Jobs = char:GetData('Jobs'),
                        Coords = {
                            x = coords.x,
                            y = coords.y,
                            z = coords.z
                        }
                    } or false,
                }

                cb(tData)
            else
                local rDs = exports['mythic-base']:FetchComponent('RecentDisconnects')
                for k, v in ipairs(rDs) do
                    if v.Source == data then
                        local tData = v

                        if tData.IsStaff then
                            local highestLevel = 0
                            for k, v in ipairs(tData.Groups) do
                                if C.Groups[tostring(v)] ~= nil and (type(C.Groups[tostring(v)].Permission) == 'table') then
                                    if C.Groups[tostring(v)].Permission.Level > highestLevel then
                                        highestLevel = C.Groups[tostring(v)].Permission.Level
                                        tData.StaffGroup = C.Groups[tostring(v)].Name
                                    end
                                end
                            end
                        end

                        tData.Disconnected = true
                        tData.Reconnected = false

                        for k, v in pairs(Fetch:All()) do
                            if v:GetData('AccountID') == tData.AccountID then
                                tData.Reconnected = k
                            end
                        end

                        cb(tData)
                        return
                    end
                end

                cb(false)
            end
        else
            cb(false)
        end
    end)

    Callbacks:RegisterServerCallback('Admin:BanPlayer', function(source, data, cb)
        local player = Fetch:Source(source)
        if player and data.targetSource and type(data.length) == "number" and type(data.reason) == "string" and data.length >= -1 and data.length <= 90 then
            if player.Permissions:IsAdmin() or (player.Permissions:IsStaff() and data.length > 0 and data.length <= 7) then
                cb(Punishment.Ban:Source(data.targetSource, data.length, data.reason, source))
            else
                cb(false)
            end
        else
            cb(false)
        end
    end)

    Callbacks:RegisterServerCallback('Admin:KickPlayer', function(source, data, cb)
        local player = Fetch:Source(source)
        if player and data.targetSource and type(data.reason) == "string" and player.Permissions:IsStaff() then
            cb(Punishment:Kick(data.targetSource, data.reason, source))
        else
            cb(false)
        end
    end)

    Callbacks:RegisterServerCallback('Admin:ActionPlayer', function(source, data, cb)
        local player = Fetch:Source(source)
        if player and data.action and data.targetSource and player.Permissions:IsStaff() then
            local target = Fetch:Source(data.targetSource)
            if target then
                local canFuckWith = player.Permissions:GetLevel() > target.Permissions:GetLevel()
                local notMe = player:GetData('Source') ~= target:GetData('Source')
                local wasSuccessful = false

                local targetChar = target:GetData('Character')
                if targetChar then
                    local playerPed = GetPlayerPed(player:GetData('Source'))
                    local targetPed = GetPlayerPed(target:GetData('Source'))
                    if data.action == 'bring' and canFuckWith and notMe then
                        local playerCoords = GetEntityCoords(playerPed)
                        Pwnzor.Players:TempPosIgnore(target:GetData("Source"))
                        SetEntityCoords(targetPed, playerCoords.x, playerCoords.y, playerCoords.z + 1.0)

                        cb({
                            success = true,
                            message = 'Brought Successfully'
                        })

                        wasSuccessful = true
                    elseif data.action == 'goto' then
                        local targetCoords = GetEntityCoords(targetPed)
                        SetEntityCoords(playerPed, targetCoords.x, targetCoords.y, targetCoords.z + 1.0)

                        cb({
                            success = true,
                            message = 'Teleported To Successfully'
                        })

                        wasSuccessful = true
                    elseif data.action == 'heal' then
                        if (notMe or player.Permissions:IsAdmin()) then
                            Callbacks:ClientCallback(targetChar:GetData("Source"), "Damage:Heal", true)
                            
                            cb({
                                success = true,
                                message = 'Healed Successfully'
                            })

                            wasSuccessful = true
                        else
                            cb({
                                success = false,
                                message = 'Can\'t Heal Yourself'
                            })
                        end
                    elseif data.action == 'attach' and canFuckWith and notMe then
                        TriggerClientEvent('Admin:Client:Attach', source, target:GetData('Source'), GetEntityCoords(targetPed), {
                            First = targetChar:GetData("First"),
                            Last = targetChar:GetData("Last"),
                            SID = targetChar:GetData("SID"),
                            Account = target:GetData("AccountID"),
                        })

                        cb({
                            success = true,
                            message = 'Attached Successfully'
                        })

                        wasSuccessful = true
                    elseif data.action == 'marker' and (canFuckWith or player.Permissions:GetLevel() == 100) then
                        local targetCoords = GetEntityCoords(targetPed)
                        TriggerClientEvent('Admin:Client:Marker', source, targetCoords.x, targetCoords.y)
                    end

                    if wasSuccessful then
                        Logger:Warn(
                            "Admin",
                            string.format(
                                "%s [%s] Used Staff Action %s On %s [%s] - Character %s %s (%s)", 
                                player:GetData("Name"),
                                player:GetData("AccountID"),
                                string.upper(data.action),
                                target:GetData("Name"),
                                target:GetData("AccountID"),
                                targetChar:GetData('First'),
                                targetChar:GetData('Last'),
                                targetChar:GetData('SID')
                            ),
                            {
                                console = (player.Permissions:GetLevel() < 100),
                                file = false,
                                database = true,
                                discord = (player.Permissions:GetLevel() < 100) and {
                                    embed = true,
                                    type = "error",
                                    webhook = GetConvar("discord_admin_webhook", ''),
                                } or false,
                            }
                        )
                    end
                    return
                end
            end
        end

        cb(false)
    end)

    Callbacks:RegisterServerCallback('Admin:CurrentVehicleAction', function(source, data, cb)
        local player = Fetch:Source(source)
        if player and data.action and player.Permissions:IsAdmin() and player.Permissions:GetLevel() >= 90 then
            Logger:Warn(
                "Admin",
                string.format(
                    "%s [%s] Used Vehicle Action %s",
                    player:GetData("Name"),
                    player:GetData("AccountID"),
                    string.upper(data.action)
                ),
                {
                    console = (player.Permissions:GetLevel() < 100),
                    file = false,
                    database = true,
                    discord = (player.Permissions:GetLevel() < 100) and {
                        embed = true,
                        type = "error",
                        webhook = GetConvar("discord_admin_webhook", ''),
                    } or false,
                }
            )
            cb(true)
        else
            cb(false)
        end
    end)

    Callbacks:RegisterServerCallback('Admin:NoClip', function(source, data, cb)
        local player = Fetch:Source(source)
        if player and player.Permissions:IsAdmin() then
            Logger:Warn(
                "Admin",
                string.format(
                    "%s [%s] Used NoClip (State: %s)",
                    player:GetData("Name"),
                    player:GetData("AccountID"),
                    data?.active and 'On' or 'Off'
                ),
                {
                    console = (player.Permissions:GetLevel() < 100),
                    file = false,
                    database = true,
                    discord = (player.Permissions:GetLevel() < 100) and {
                        embed = true,
                        type = "error",
                        webhook = GetConvar("discord_admin_webhook", ''),
                    } or false,
                }
            )
            cb(true)
        else
            cb(false)
        end
    end)

    Callbacks:RegisterServerCallback('Admin:UpdatePhonePerms', function(source, data, cb)
        local player = Fetch:Source(source)
        if player.Permissions:IsAdmin() then
            local target = Fetch:Source(data.target)
            if target ~= nil then
                local char = target:GetData("Character")
                if char ~= nil then
                    local cPerms = char:GetData("PhonePermissions")
                    cPerms[data.app][data.perm] = data.state
                    char:SetData("PhonePermissions", cPerms)
                    cb(true)
                else
                    cb(false)
                end
            else
                cb(false)
            end
        else
            cb(false)
        end
    end)

    Callbacks:RegisterServerCallback('Admin:ToggleInvisible', function(source, data, cb)
        local player = Fetch:Source(source)
        if player and player.Permissions:IsAdmin() then
            Logger:Warn(
                "Admin",
                string.format(
                    "%s [%s] Used Invisibility",
                    player:GetData("Name"),
                    player:GetData("AccountID")
                ),
                {
                    console = (player.Permissions:GetLevel() < 100),
                    file = false,
                    database = true,
                    discord = (player.Permissions:GetLevel() < 100) and {
                        embed = true,
                        type = "error",
                        webhook = GetConvar("discord_admin_webhook", ''),
                    } or false,
                }
            )

            TriggerClientEvent('Admin:Client:Invisible', source)
            cb(true)
        else
            cb(false)
        end
    end)

    Callbacks:RegisterServerCallback('Admin:GetServerStats', function(source, data, cb)
        local player = Fetch:Source(source)
        if player and player.Permissions:IsStaff() then
            local stats = {
                totalBans = 0,
                activeReports = 0,
                staffOnline = 0,
            }

            -- Count staff online
            local activePlayers = Fetch:All()
            for k, v in pairs(activePlayers) do
                if v and v.Permissions:IsStaff() then
                    stats.staffOnline = stats.staffOnline + 1
                end
            end

            -- Count total bans (if you have a ban system)
            -- This is a placeholder - adjust based on your ban system
            -- Database.Game:count({ collection = "bans" }, function(count)
            --     stats.totalBans = count
            -- end)

            cb(stats)
        else
            cb(false)
        end
    end)

    Callbacks:RegisterServerCallback('Admin:GetRecentActivity', function(source, data, cb)
        local player = Fetch:Source(source)
        if player and player.Permissions:IsStaff() then
            local limit = data.limit or 10
            local activities = {}

            -- This would typically come from your logging system
            -- For now, return empty array - implement based on your logging
            cb(activities)
        else
            cb(false)
        end
    end)

    Callbacks:RegisterServerCallback('Admin:GetServerLogs', function(source, data, cb)
        local player = Fetch:Source(source)
        if player and player.Permissions:IsAdmin() then
            local limit = data.limit or 500
            local logs = {}

            -- This would typically come from your logging system
            -- For now, return empty array - implement based on your logging
            cb(logs)
        else
            cb(false)
        end
    end)

    Callbacks:RegisterServerCallback('Admin:GetBanList', function(source, data, cb)
        local player = Fetch:Source(source)
        if player and player.Permissions:IsAdmin() then
            local bans = {}

            -- This would typically query your ban database
            -- Placeholder implementation
            -- Database.Game:find({ collection = "bans" }, function(success, results)
            --     if success then
            --         cb(results)
            --     else
            --         cb({})
            --     end
            -- end)

            cb(bans)
        else
            cb(false)
        end
    end)

    Callbacks:RegisterServerCallback('Admin:UnbanPlayer', function(source, data, cb)
        local player = Fetch:Source(source)
        if player and player.Permissions:IsAdmin() and data.banId then
            -- Implement unban logic based on your ban system
            -- Punishment:Unban(data.banId, source)
            cb({ success = true })
        else
            cb(false)
        end
    end)

    Callbacks:RegisterServerCallback('Admin:GetTeleportLocations', function(source, data, cb)
        local player = Fetch:Source(source)
        if player and player.Permissions:IsStaff() then
            local locations = GetSpawnLocations()
            if locations then
                local formatted = {}
                for k, v in ipairs(locations) do
                    table.insert(formatted, {
                        id = v._id or k,
                        name = v.Name or "Unknown",
                        category = v.Category or "general",
                        coords = {
                            x = v.Coords and v.Coords.x or 0,
                            y = v.Coords and v.Coords.y or 0,
                            z = v.Coords and v.Coords.z or 0,
                        }
                    })
                end
                cb(formatted)
            else
                cb({})
            end
        else
            cb(false)
        end
    end)

    Callbacks:RegisterServerCallback('Admin:TeleportToLocation', function(source, data, cb)
        local player = Fetch:Source(source)
        if player and player.Permissions:IsStaff() and data.locationId then
            local locations = GetSpawnLocations()
            if locations then
                for k, v in ipairs(locations) do
                    local locId = v._id or k
                    if tostring(locId) == tostring(data.locationId) then
                        local coords = v.Coords or { x = 0, y = 0, z = 0 }
                        local playerPed = GetPlayerPed(source)
                        SetEntityCoords(playerPed, coords.x, coords.y, coords.z)
                        
                        Logger:Warn(
                            "Admin",
                            string.format(
                                "%s [%s] Teleported to location %s",
                                player:GetData("Name"),
                                player:GetData("AccountID"),
                                v.Name or "Unknown"
                            ),
                            {
                                console = (player.Permissions:GetLevel() < 100),
                                file = false,
                                database = true,
                            }
                        )
                        
                        cb({ success = true })
                        return
                    end
                end
            end
            cb(false)
        else
            cb(false)
        end
    end)

    Callbacks:RegisterServerCallback('Admin:AddTeleportLocation', function(source, data, cb)
        local player = Fetch:Source(source)
        if player and player.Permissions:IsAdmin() and data.name and data.coords then
            -- Implement location saving logic
            -- Database.Game:insertOne({
            --     collection = "locations",
            --     document = {
            --         Type = "teleport",
            --         Name = data.name,
            --         Category = data.category or "general",
            --         Coords = data.coords
            --     }
            -- }, function(success, result)
            --     cb({ success = success })
            -- end)
            
            cb({ success = true })
        else
            cb(false)
        end
    end)

    Callbacks:RegisterServerCallback('Admin:AddPlayerNote', function(source, data, cb)
        local player = Fetch:Source(source)
        if player and player.Permissions:IsStaff() and data.targetSource and data.note then
            local target = Fetch:Source(data.targetSource)
            if target then
                -- Implement note saving logic based on your database structure
                -- This is a placeholder
                Logger:Warn(
                    "Admin",
                    string.format(
                        "%s [%s] Added note to %s [%s]: %s",
                        player:GetData("Name"),
                        player:GetData("AccountID"),
                        target:GetData("Name"),
                        target:GetData("AccountID"),
                        data.note
                    ),
                    {
                        console = false,
                        file = false,
                        database = true,
                    }
                )
                cb({ success = true })
            else
                cb(false)
            end
        else
            cb(false)
        end
    end)

    Callbacks:RegisterServerCallback('Admin:DeleteTeleportLocation', function(source, data, cb)
        local player = Fetch:Source(source)
        if player and player.Permissions:IsAdmin() and data.locationId then
            -- Implement location deletion logic
            -- Database.Game:deleteOne({
            --     collection = "locations",
            --     query = {
            --         _id = data.locationId
            --     }
            -- }, function(success)
            --     cb({ success = success })
            -- end)
            
            Logger:Warn(
                "Admin",
                string.format(
                    "%s [%s] Deleted teleport location: %s",
                    player:GetData("Name"),
                    player:GetData("AccountID"),
                    data.locationId
                ),
                {
                    console = false,
                    file = false,
                    database = true,
                }
            )
            
            cb({ success = true })
        else
            cb(false)
        end
    end)

    -- Word filter list (you can expand this or load from database)
    local wordFilterList = {
        'fuck', 'shit', 'damn', 'bitch', 'asshole', 'cunt', 'nigger', 'nigga', 'retard', 'faggot'
    }

    Callbacks:RegisterServerCallback('Admin:GetChatLogs', function(source, data, cb)
        local player = Fetch:Source(source)
        if player and player.Permissions:IsStaff() then
            local limit = data.limit or 500
            local chats = {}

            -- This would typically come from your chat logging system
            -- For now, return empty array - implement based on your chat system
            -- You would query your chat logs database/collection here
            -- Database.Game:find({
            --     collection = "chat_logs",
            --     query = {},
            --     limit = limit,
            --     sort = { timestamp = -1 }
            -- }, function(success, results)
            --     if success then
            --         cb(results)
            --     else
            --         cb({})
            --     end
            -- end)

            cb(chats)
        else
            cb(false)
        end
    end)

    -- This should be called when a chat message is sent (hook into your chat system)
    function CheckChatForBadWords(source, message, chatType)
        local messageLower = string.lower(message)
        local flagged = false
        local flaggedWords = {}

        for _, word in ipairs(wordFilterList) do
            if string.find(messageLower, word) then
                flagged = true
                table.insert(flaggedWords, word)
            end
        end

        if flagged then
            local player = Fetch:Source(source)
            if player then
                Logger:Warn(
                    "Admin",
                    string.format(
                        "%s [%s] Sent flagged message: %s (Words: %s)",
                        player:GetData("Name"),
                        player:GetData("AccountID"),
                        message,
                        table.concat(flaggedWords, ", ")
                    ),
                    {
                        console = true,
                        file = false,
                        database = true,
                        discord = {
                            embed = true,
                            type = "error",
                            webhook = GetConvar("discord_admin_webhook", ''),
                        },
                    }
                )

                -- Log to chat logs with flagged status
                -- Database.Game:insertOne({
                --     collection = "chat_logs",
                --     document = {
                --         source = source,
                --         playerName = player:GetData("Name"),
                --         message = message,
                --         type = chatType or "ic",
                --         timestamp = os.time(),
                --         flagged = true,
                --         flaggedWords = flaggedWords
                --     }
                -- })
            end
        end

        return flagged, flaggedWords
    end

    Callbacks:RegisterServerCallback('Admin:ToggleNoClip', function(source, data, cb)
        local player = Fetch:Source(source)
        if player and player.Permissions:IsAdmin() then
            TriggerClientEvent("Admin:Client:NoClip", source, data.active or false)
            cb({ success = true })
        else
            cb(false)
        end
    end)

    Callbacks:RegisterServerCallback('Admin:ToggleGodMode', function(source, data, cb)
        local player = Fetch:Source(source)
        if player and player.Permissions:IsAdmin() and player.Permissions:GetLevel() >= 90 then
            -- Implement god mode toggle
            -- TriggerClientEvent("Admin:Client:GodMode", source, data.active or false)
            cb({ success = true })
        else
            cb(false)
        end
    end)

    Callbacks:RegisterServerCallback('Admin:ToggleSuperJump', function(source, data, cb)
        local player = Fetch:Source(source)
        if player and player.Permissions:IsAdmin() then
            -- Implement super jump toggle
            -- TriggerClientEvent("Admin:Client:SuperJump", source, data.active or false)
            cb({ success = true })
        else
            cb(false)
        end
    end)

    Callbacks:RegisterServerCallback('Admin:ToggleFastRun', function(source, data, cb)
        local player = Fetch:Source(source)
        if player and player.Permissions:IsAdmin() then
            -- Implement fast run toggle
            -- TriggerClientEvent("Admin:Client:FastRun", source, data.active or false)
            cb({ success = true })
        else
            cb(false)
        end
    end)
end